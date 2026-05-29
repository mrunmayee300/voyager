import OpenAI from 'openai';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const SYSTEM_PROMPT = `You are Voyager, a practical international travel assistant. Be concise, warm, and accurate.
Focus on visa guidance, packing, customs, budgeting, and itinerary tips.
If uncertain, say so and recommend official embassy sources.
Never invent visa rules — suggest users verify with official government sites.

FORMAT every reply in Markdown:
- Start with a one-line summary in bold.
- Use ### for section headings (e.g. ### Documents, ### Tips).
- Use bullet lists (- item) for steps, documents, and packing lists.
- Use numbered lists (1. step) only for sequential procedures.
- Keep paragraphs short (2–3 sentences max).
- End with a brief ### Good to know or ### Next step when helpful.
Do not wrap the entire response in a code block.`;

export async function chatWithAssistant(
  userId: string,
  message: string,
  options?: { tripId?: string; chatId?: string },
) {
  let chat = options?.chatId
    ? await prisma.aiChat.findFirst({ where: { id: options.chatId, userId } })
    : null;

  if (!chat) {
    chat = await prisma.aiChat.create({
      data: { userId, tripId: options?.tripId, title: message.slice(0, 60) },
    });
  }

  await prisma.aiMessage.create({
    data: { chatId: chat.id, role: 'USER', content: message },
  });

  const history = await prisma.aiMessage.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  const contextChunks = await prisma.knowledgeChunk.findMany({
    where: {
      OR: [
        { content: { contains: message.split(' ')[0], mode: 'insensitive' } },
        { category: { in: ['visa', 'customs', 'packing'] } },
      ],
    },
    take: 3,
  });

  const ragContext = contextChunks
    .map((c) => `[${c.title}]: ${c.content}`)
    .join('\n\n');

  const citations = contextChunks.map((c) => ({
    title: c.title,
    sourceUrl: c.sourceUrl,
  }));

  let reply: string;
  let confidence = 0.75;

  if (openai) {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nReference knowledge:\n${ragContext}` },
        ...history.map((m) => ({
          role: m.role.toLowerCase() as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
      ],
      max_tokens: 600,
      temperature: 0.4,
    });
    reply =
      completion.choices[0]?.message?.content ||
      'I could not generate a response. Please try again.';
    confidence = 0.88;
  } else {
    reply = generateFallbackResponse(message, ragContext);
    confidence = 0.6;
  }

  await prisma.aiMessage.create({
    data: {
      chatId: chat.id,
      role: 'ASSISTANT',
      content: reply,
      citations,
      confidence,
    },
  });

  return {
    chatId: chat.id,
    message: reply,
    citations,
    confidence,
    suggestedPrompts: [
      'What documents do I need for a Schengen visa?',
      'How much cash should I carry abroad?',
      'What should I pack for a 2-week trip?',
      'Airport forex vs local ATM — which is better?',
    ],
  };
}

function generateFallbackResponse(message: string, context: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('visa')) {
    return `**Visa guidance**

### What to do
- Check the **official embassy website** for your nationality first.
- Use Voyager's **Visa Planner** for country-specific checklists.

${context ? `### From our knowledge base\n${context.slice(0, 400)}\n` : ''}
### Good to know
Immigration rules change — always confirm fees and processing times on government sites before applying.`;
  }
  if (lower.includes('pack')) {
    return `**Packing essentials**

### Documents & tech
- Passport copies (digital + print)
- Universal power adapter
- Offline maps downloaded

### Health & comfort
- Medications in **original packaging** with prescriptions
- One complete outfit in carry-on

### Good to know
Match clothing to season and local cultural norms at your destination.`;
  }
  if (lower.includes('currency') || lower.includes('forex')) {
    return `**Money abroad**

### Recommended
- Cards with **no foreign transaction fees**
- Withdraw from reputable bank ATMs (better rates than airport counters)

### On arrival
- Keep a small amount of **local cash** for transport and tips

### Avoid
- Large exchanges at airport counters — fees are often 8–15% higher.`;
  }
  return `**Travel assistant (offline mode)**

OpenAI is not configured. For full answers, add \`OPENAI_API_KEY\` to your API environment.

### You can still use
- **Trip Planner** — timelines and budgets
- **Visa Engine** — document checklists by purpose

${context ? `### Reference\n${context.slice(0, 280)}` : ''}`;
}

export async function getUserChats(userId: string) {
  return prisma.aiChat.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
}

export async function getChatMessages(userId: string, chatId: string) {
  const chat = await prisma.aiChat.findFirst({ where: { id: chatId, userId } });
  if (!chat) throw new AppError('Chat not found', 404);
  return prisma.aiMessage.findMany({
    where: { chatId },
    orderBy: { createdAt: 'asc' },
  });
}
