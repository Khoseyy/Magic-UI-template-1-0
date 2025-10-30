"use client";

import Script from "next/script";

import { SectionHeader } from "@/components/section-header";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

export function SchedulingSection() {
  const config = siteConfig.bookingSection;

  const baseCardClass =
    "rounded-3xl border border-border bg-[#F3F4F6] dark:bg-white/[0.05] shadow-[0px_1px_2px_rgba(15,23,42,0.08),0px_12px_28px_-18px_rgba(15,23,42,0.35)] transition-all duration-200";

  return (
    <section
      id="booking"
      className="flex w-full flex-col items-center justify-center gap-10 pb-16"
    >
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />

      <SectionHeader>
        <h2 className="text-balance text-center text-3xl font-medium tracking-tighter md:text-4xl">
          {config.title}
        </h2>
        <p className="text-balance text-center font-medium text-muted-foreground">
          {config.description}
        </p>
        <p className="text-center text-sm text-muted-foreground/80">
          {config.subtitle}
        </p>
      </SectionHeader>

      <div className="w-full max-w-5xl px-6">
        <div
          className={cn(
            baseCardClass,
            "flex w-full items-stretch justify-center overflow-hidden p-0",
          )}
        >
          <div
            className="calendly-inline-widget w-full"
            data-url="https://calendly.com/kristof-hoseysolutions/30min"
            style={{ minWidth: "320px", height: "720px" }}
          />
        </div>
      </div>
    </section>
  );
}
