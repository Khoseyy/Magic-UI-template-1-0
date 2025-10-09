"use client";

import { SectionHeader } from "@/components/section-header";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, MapPin, MoveLeft, MoveRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { FormEvent, useMemo, useState } from "react";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_TIME_ZONE = "Europe/London";

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
};

function getDatePartsInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return { year, month, day };
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const localeString = date.toLocaleString("en-US", { timeZone });
  const tzDate = new Date(localeString);
  return (date.getTime() - tzDate.getTime()) / 60000;
}

function createSlotInstant(baseDate: Date, slot: string, baseTimeZone: string) {
  const [hours, minutes] = slot.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  const { year, month, day } = getDatePartsInZone(baseDate, baseTimeZone);
  if (!year || !month || !day) {
    return null;
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const offsetMinutes = getTimeZoneOffsetMinutes(utcDate, baseTimeZone);
  return new Date(utcDate.getTime() - offsetMinutes * 60000);
}

function formatTimeWithZone(
  date: Date,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
    ...(options ?? {}),
  }).format(date);
}

function getZoneAbbreviation(timeZone: string) {
  try {
    const part = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      timeZoneName: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(new Date())
      .find((item) => item.type === "timeZoneName");

    return part?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - day);
  return result;
}

function buildWeekDays(startDate: Date) {
  const weekStart = new Date(startDate);
  weekStart.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: CalendarDay[] = [];

  for (let index = 0; index < 7; index += 1) {
    const current = new Date(weekStart);
    current.setDate(weekStart.getDate() + index);

    days.push({
      date: current,
      isCurrentMonth: current.getMonth() === weekStart.getMonth(),
      isToday:
        current.getFullYear() === today.getFullYear() &&
        current.getMonth() === today.getMonth() &&
        current.getDate() === today.getDate(),
    });
  }

  return days;
}

function formatDisplayDate(date: Date | null) {
  if (!date) return "Select a date";
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function SchedulingSection() {
  const config = siteConfig.bookingSection;
  const [visibleWeekStart, setVisibleWeekStart] = useState(() => startOfWeek(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const baseTimeZone = config.availability.baseTimeZone ?? DEFAULT_TIME_ZONE;
  const userTimeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return baseTimeZone;
    }
  }, [baseTimeZone]);
  const baseZoneAbbr = useMemo(() => getZoneAbbreviation(baseTimeZone), [baseTimeZone]);
  const userZoneAbbr = useMemo(() => getZoneAbbreviation(userTimeZone), [userTimeZone]);

  const calendarDays = useMemo(
    () => buildWeekDays(visibleWeekStart),
    [visibleWeekStart],
  );

  const weekLabel = useMemo(() => {
    const weekEnd = new Date(visibleWeekStart);
    weekEnd.setDate(visibleWeekStart.getDate() + 6);

    const sameMonth = weekEnd.getMonth() === visibleWeekStart.getMonth();
    const sameYear = weekEnd.getFullYear() === visibleWeekStart.getFullYear();

    const startLabel = visibleWeekStart.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: sameYear ? undefined : "numeric",
    });
    const endLabel = weekEnd.toLocaleDateString("en-GB", {
      day: "numeric",
      month: sameMonth ? undefined : "short",
      year: "numeric",
    });

    return `${startLabel} – ${endLabel}`;
  }, [visibleWeekStart]);

  const handleWeekChange = (direction: "prev" | "next") => {
    setVisibleWeekStart((prev) => {
      const nextWeek = new Date(prev);
      nextWeek.setDate(prev.getDate() + (direction === "next" ? 7 : -7));
      return startOfWeek(nextWeek);
    });
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleSelectDate = (day: CalendarDay) => {
    if (!day.isCurrentMonth) {
      setVisibleMonth(day.date);
    }
    setSelectedDate(day.date);
    setSelectedSlot(null);
  };

  const availableSlots = config.availability.timeSlots;
  const selectedSlotInstant = useMemo(
    () =>
      selectedDate && selectedSlot
        ? createSlotInstant(selectedDate, selectedSlot, baseTimeZone)
        : null,
    [selectedDate, selectedSlot, baseTimeZone],
  );
  const selectedSlotLocalLabel = useMemo(() => {
    if (!selectedSlotInstant || userTimeZone === baseTimeZone) {
      return null;
    }

    return formatTimeWithZone(selectedSlotInstant, userTimeZone, {
      timeZoneName: "short",
    });
  }, [selectedSlotInstant, userTimeZone, baseTimeZone]);
  const selectedSlotBaseLabel = useMemo(() => {
    if (!selectedSlotInstant) {
      return null;
    }

    return formatTimeWithZone(selectedSlotInstant, baseTimeZone, {
      timeZoneName: "short",
    });
  }, [selectedSlotInstant, baseTimeZone]);
  const selectedSessionLabel = useMemo(() => {
    if (!selectedDate || !selectedSlot) {
      return "Choose a date and time";
    }

    const dateLabel = selectedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
    });

    return `${dateLabel} · ${selectedSlotBaseLabel ?? selectedSlot}`;
  }, [selectedDate, selectedSlot, selectedSlotBaseLabel]);
  const baseCardClass =
    "rounded-3xl border border-border bg-[#F3F4F6] dark:bg-white/[0.05] shadow-[0px_1px_2px_rgba(15,23,42,0.08),0px_18px_40px_-20px_rgba(15,23,42,0.45)] transition-all duration-200";
  const hoverLift = "hover:-translate-y-1 hover:shadow-[0px_18px_45px_-12px_rgba(15,23,42,0.5)]";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedDate || !selectedSlot || !guestName.trim() || !guestEmail.trim()) {
      return;
    }

    try {
      const response = await fetch("https://formspree.io/f/mzzjalon", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: guestName.trim(),
          email: guestEmail.trim(),
          message: guestMessage.trim(),
          date: selectedDate.toISOString(),
          slot: selectedSlot,
          baseTimeZone,
          userTimeZone,
          selectedSlotBaseLabel,
          selectedSlotLocalLabel,
        }),
      });

      if (!response.ok) {
        console.error("Failed to submit booking form", await response.text());
        return;
      }

      setIsBookingModalOpen(false);
      setGuestName("");
      setGuestEmail("");
      setGuestMessage("");
    } catch (error) {
      console.error("Error submitting booking form", error);
    }
  };

  return (
    <section
      id="booking"
      className="flex w-full flex-col items-center justify-center gap-10 pb-16"
    >
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

      <div className="grid w-full max-w-6xl gap-6 px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:max-w-5xl">
        <div className="flex flex-col gap-5">
          <div
            className={cn(
              baseCardClass,
              hoverLift,
              "relative overflow-hidden p-6"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary/20 text-secondary">
                <CalendarIcon className="size-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  {config.calendarCard.name}
                </p>
                <h3 className="text-xl font-semibold text-primary">Book in minutes</h3>
              </div>
            </div>
            <p className="mt-4 text-sm text-white">
              {config.calendarCard.description}
            </p>
            <p className="mt-5 text-xs text-white/80">
              {config.calendarCard.cta}
            </p>
            <span className="pointer-events-none absolute -right-20 -top-20 size-44 rounded-full bg-secondary/15" />
          </div>

          <div className={cn(baseCardClass, hoverLift, "p-6")}> 
            <h3 className="text-xl font-semibold text-primary">What we’ll cover</h3>
            <ul className="mt-5 space-y-3 text-white">
              {config.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-sm"
                >
                  <span className="mt-1.5 size-2 rounded-full bg-secondary" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 grid gap-3 rounded-2xl bg-white/60 p-4 text-sm text-muted-foreground dark:bg-white/[0.03]">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-secondary" />
                <span className="font-medium text-primary">
                  {config.availability.durationLabel}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-secondary" />
                  <span className="font-medium text-primary">
                    {config.availability.timezoneLabel} ({baseZoneAbbr})
                  </span>
                </div>
                {userTimeZone !== baseTimeZone && (
                  <span className="pl-6 text-xs text-muted-foreground/75">
                    Your timezone: {userTimeZone} ({userZoneAbbr})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            baseCardClass,
            "overflow-hidden w-full max-w-[520px] justify-self-center lg:justify-self-end"
          )}
        >
          <div className="flex items-center justify-between border-b border-border/70 bg-white/70 p-6 dark:bg-white/[0.04]">
            <button
              type="button"
              onClick={() => handleWeekChange("prev")}
              className="rounded-full border border-border bg-white/70 p-2 text-muted-foreground transition hover:bg-white hover:shadow-sm dark:bg-white/[0.03]"
              aria-label="Previous month"
            >
              <MoveLeft className="size-4" />
            </button>

            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                Plan ahead
              </p>
              <p className="text-xl font-semibold text-primary">{weekLabel}</p>
            </div>

            <button
              type="button"
              onClick={() => handleWeekChange("next")}
              className="rounded-full border border-border bg-white/70 p-2 text-muted-foreground transition hover:bg-white hover:shadow-sm dark:bg-white/[0.03]"
              aria-label="Next month"
            >
              <MoveRight className="size-4" />
            </button>
          </div>

          <div className="space-y-4 p-6">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase text-muted-foreground">
              {DAYS_OF_WEEK.map((day) => (
                <span key={day} className="py-1.5 tracking-[0.1em]">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 text-sm">
              {calendarDays.map((day) => {
                const isSelected =
                  !!selectedDate &&
                  day.date.getFullYear() === selectedDate.getFullYear() &&
                  day.date.getMonth() === selectedDate.getMonth() &&
                  day.date.getDate() === selectedDate.getDate();

                return (
                  <button
                    key={day.date.toISOString()}
                    type="button"
                    onClick={() => handleSelectDate(day)}
                    className={cn(
                      "relative flex h-12 items-center justify-center overflow-hidden rounded-2xl border text-sm font-medium transition-all",
                      day.isCurrentMonth
                        ? "border-transparent bg-white/70 text-primary hover:border-secondary/60 hover:shadow-[0_6px_18px_-12px_rgba(15,23,42,0.45)] dark:bg-white/[0.05] dark:text-white"
                        : "border-dashed border-border/60 bg-transparent text-muted-foreground/60",
                      day.isToday && "border-secondary/70",
                      isSelected && "border-transparent text-secondary-foreground",
                    )}
                  >
                    <AnimatePresence>
                      {isSelected && (
                        <motion.span
                          layoutId="booking-day-highlight"
                          className="absolute inset-0 rounded-2xl bg-secondary shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_6px_12px_-6px_rgba(37,99,235,0.45)]"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative z-10">{day.date.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-5 border-t border-border/70 bg-white/60 p-6 text-sm text-muted-foreground dark:bg-white/[0.03]">
            <p className="font-medium text-primary">{formatDisplayDate(selectedDate)}</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              {config.availability.warmupCopy}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {availableSlots.map((slot) => {
                const isActive = selectedSlot === slot;
                const isDisabled = !selectedDate;
                const slotInstant =
                  selectedDate && !isDisabled
                    ? createSlotInstant(selectedDate, slot, baseTimeZone)
                    : null;
                const baseLabel = slotInstant
                  ? formatTimeWithZone(slotInstant, baseTimeZone, {
                      timeZoneName: "short",
                    })
                  : `${slot} ${baseZoneAbbr}`;
                const localLabel =
                  slotInstant && userTimeZone !== baseTimeZone
                    ? formatTimeWithZone(slotInstant, userTimeZone, {
                        timeZoneName: "short",
                      })
                    : null;

                return (
                  <motion.button
                    key={slot}
                    type="button"
                    onClick={() => !isDisabled && setSelectedSlot(slot)}
                    disabled={isDisabled}
                    className={cn(
                      "relative flex items-center justify-center overflow-hidden rounded-full border border-border px-4 py-2 text-sm font-medium tracking-wide text-white transition-all ease-out",
                      isDisabled && "cursor-not-allowed opacity-50",
                      isActive && "border-transparent",
                      !isActive && "hover:border-secondary/60 hover:bg-secondary/10",
                    )}
                    whileTap={!isDisabled ? { scale: 0.96 } : undefined}
                  >
                    <AnimatePresence>
                      {isActive && (
                        <motion.span
                          layoutId="booking-slot-highlight"
                          className="absolute inset-0 rounded-full border border-secondary bg-secondary text-secondary-foreground shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)]"
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.92 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative z-10 flex flex-col items-center leading-tight text-white">
                      <span className="font-medium text-white">{baseLabel}</span>
                      {localLabel && (
                        <span className="text-[10px] font-normal text-white/80">
                          {localLabel} · your time
                        </span>
                      )}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 border-t border-border/70 bg-white/80 p-6 text-sm text-muted-foreground dark:bg-white/[0.05]">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                Selected session
              </p>
              <p className="text-lg font-semibold text-primary">
                {selectedSessionLabel}
              </p>
              {selectedSlotLocalLabel && (
                <p className="text-xs text-white/80">
                  Your time: {selectedSlotLocalLabel}
                </p>
              )}
            </div>
            <motion.button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              disabled={!selectedDate || !selectedSlot}
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-full bg-secondary px-6 text-sm font-medium text-secondary-foreground shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)] transition-all ease-out active:scale-95",
                (!selectedDate || !selectedSlot) && "cursor-not-allowed opacity-50",
              )}
              whileTap={
                !selectedDate || !selectedSlot
                  ? undefined
                  : { scale: 0.94 }
              }
            >
              {config.cta.primary.text}
            </motion.button>
            <p className="text-xs text-white/70">
              {config.cta.secondary} Sessions run on {baseZoneAbbr}
              {userTimeZone !== baseTimeZone ? ` / ${baseTimeZone}` : ""}.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isBookingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
            onClick={() => setIsBookingModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="relative mx-4 w-full max-w-md rounded-3xl border border-border/80 bg-background/95 p-6 text-left shadow-[0_24px_120px_-30px_rgba(15,23,42,0.8)] backdrop-blur-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-border/60 bg-background/80 text-muted-foreground transition hover:scale-95"
                aria-label="Close booking form"
              >
                ×
              </button>
              <div className="mb-6 space-y-1">
                <h3 className="text-lg font-semibold text-primary">Finalise Your Booking</h3>
                <p className="text-sm text-muted-foreground">
                  We’ll send confirmation and reminders to the email you provide.
                </p>
              </div>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <label htmlFor="modal-name" className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Name
                  </label>
                  <input
                    id="modal-name"
                    type="text"
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    placeholder="Enter your full name"
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="modal-email" className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Email
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    value={guestEmail}
                    onChange={(event) => setGuestEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="modal-message" className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Message (optional)
                  </label>
                  <textarea
                    id="modal-message"
                    value={guestMessage}
                    onChange={(event) => setGuestMessage(event.target.value)}
                    placeholder="Share any context you'd like us to review before the call."
                    rows={3}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={!guestName.trim() || !guestEmail.trim()}
                  className={cn(
                    "inline-flex h-11 items-center justify-center rounded-full bg-secondary px-6 text-sm font-medium text-secondary-foreground shadow-[inset_0_1px_2px_rgba(255,255,255,0.25),0_3px_3px_-1.5px_rgba(16,24,40,0.06),0_1px_1px_rgba(16,24,40,0.08)] transition-all ease-out active:scale-95",
                    (!guestName.trim() || !guestEmail.trim()) && "cursor-not-allowed opacity-60",
                  )}
                  whileTap={!guestName.trim() || !guestEmail.trim() ? undefined : { scale: 0.94 }}
                >
                  Send confirmation
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
