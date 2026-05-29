'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
          alt="Traveler overlooking a European city"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sand-900/85 via-sand-900/50 to-sand-900/20" />
      </div>

      <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-end px-5 pb-20 pt-32 md:px-8 md:pb-28 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-sand-100/70">
            International travel, simplified
          </p>
          <h1 className="editorial-heading text-4xl font-semibold text-white md:text-5xl lg:text-6xl text-balance">
            Plan your journey abroad with confidence
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-sand-100/85">
            Visas, budgets, timelines, and local guidance — structured for real travelers, not
            spreadsheet warriors.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/planner">
              <Button size="lg" variant="accent" className="group">
                Start planning
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="/visa">
              <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                Check visa requirements
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 flex flex-wrap gap-8 text-sm text-sand-100/60"
        >
          <span>Trusted by travelers planning 40+ routes</span>
          <span>·</span>
          <span>Visa data with source citations</span>
          <span>·</span>
          <span>Built for first-time international trips</span>
        </motion.div>
      </div>
    </section>
  );
}
