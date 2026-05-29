# API Sample Responses

Base: `http://localhost:4000/api/v1`

## POST /auth/register

**Request:**
```json
{
  "email": "traveler@example.com",
  "password": "securepass123",
  "firstName": "Alex",
  "lastName": "Rivera"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "clx...",
    "email": "traveler@example.com",
    "firstName": "Alex",
    "lastName": "Rivera",
    "createdAt": "2026-05-28T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## GET /visa/requirements?origin=IND&destination=FRA

**Response:**
```json
{
  "found": true,
  "requirement": {
    "type": "EMBASSY_VISA",
    "label": "Embassy visa required",
    "maxStayDays": 90,
    "processing": { "minDays": 15, "maxDays": 30 },
    "feeUsd": 80,
    "documents": [
      "Valid passport (6+ months)",
      "Schengen application form",
      "Travel insurance (€30k+)"
    ],
    "steps": [
      "Book VFS appointment",
      "Complete Schengen form",
      "Gather documents",
      "Attend biometrics",
      "Track application online"
    ],
    "interviewRequired": false,
    "sourceUrl": "https://www.iatatravelcentre.com/",
    "confidence": 0.9,
    "origin": { "code": "IND", "name": "India", "flagEmoji": "🇮🇳" },
    "destination": { "code": "FRA", "name": "France", "flagEmoji": "🇫🇷", "currency": "EUR" }
  }
}
```

## POST /planner/generate

**Request:**
```json
{
  "originCountryCode": "IND",
  "destinationCountryCode": "FRA",
  "originCity": "Mumbai",
  "destinationCity": "Paris",
  "startDate": "2026-08-15",
  "durationDays": 10,
  "budgetTier": "MODERATE",
  "travelerCount": 1,
  "passportValidMonths": 8
}
```

**Response (excerpt):**
```json
{
  "meta": {
    "origin": { "code": "IND", "name": "India", "flag": "🇮🇳" },
    "destination": { "code": "FRA", "name": "France", "flag": "🇫🇷" },
    "durationDays": 10,
    "purpose": "TOURISM"
  },
  "visa": { "found": true, "requirement": { "label": "Embassy visa required" } },
  "passportCheck": { "status": "ok", "message": "Passport validity meets typical 6-month requirement" },
  "budget": {
    "tier": "MODERATE",
    "totals": { "low": 1840, "moderate": 3420, "luxury": 6890 },
    "items": [{ "category": "flights", "label": "Round-trip flights", "low": 450, "mid": 750, "high": 1400 }]
  },
  "timeline": [
    { "daysBefore": 60, "title": "Start visa process", "tasks": ["Check passport validity"] }
  ],
  "checklist": [{ "id": "passport", "label": "Valid passport (6+ months)", "category": "documents", "done": false }]
}
```

## GET /centers/nearby?city=Mumbai

**Response:**
```json
{
  "reference": { "city": "Mumbai", "latitude": 19.076, "longitude": 72.8777 },
  "centers": [
    {
      "id": "clx...",
      "name": "VFS Global — France Visa",
      "type": "visa_center",
      "address": "Trade Centre, Bandra Kurla Complex, Mumbai",
      "distanceKm": 2.3,
      "website": "https://visa.vfsglobal.com/ind/en/fra",
      "waitDaysEst": 5
    }
  ]
}
```

## POST /ai/chat

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{ "message": "What documents do I need for Japan visa from India?" }
```

**Response:**
```json
{
  "chatId": "clx...",
  "message": "You'll typically need a valid passport, application form...",
  "citations": [{ "title": "Japan customs — prohibited items", "sourceUrl": "https://www.customs.go.jp/" }],
  "confidence": 0.88,
  "suggestedPrompts": ["How much cash should I carry abroad?"]
}
```
