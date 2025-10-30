/* eslint-disable @next/next/no-img-element */
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

export interface TestimonialCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  role: string;
  img?: string;
  description: React.ReactNode;
  className?: string;
}

export const TestimonialCard = ({
  description,
  name,
  img,
  role,
  className,
  ...props
}: TestimonialCardProps) => (
  <div
    className={cn(
      "flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl p-4",
      // light styles
      "bg-accent",
      "shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_8px_12px_-4px_rgba(15,12,12,0.08),0px_1px_2px_0px_rgba(15,12,12,0.10)] dark:shadow-[0px_0px_0px_1px_rgba(250,250,250,0.1),0px_0px_0px_1px_#18181B,0px_8px_12px_-4px_rgba(15,12,12,0.3),0px_1px_2px_0px_rgba(15,12,12,0.3)]",
      className,
    )}
    {...props}
  >
    <div className="select-none leading-relaxed font-normal text-primary/90">
      {description}
    </div>

    <div className="flex w-full select-none items-center justify-start gap-3.5">
      <img src={img} alt={name} className="size-8 rounded-full object-cover" />

      <div>
        <p className="font-medium text-primary/90">{name}</p>
        <p className="text-xs font-normal text-primary/50">{role}</p>
      </div>
    </div>
  </div>
);

interface Testimonial {
  id: string;
  name: string;
  role: string;
  img: string;
  description: React.ReactNode;
}

export function SocialProofTestimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const columnCount = Math.min(3, Math.max(1, testimonials.length));
  const columns = Array.from({ length: columnCount }, () => [] as Testimonial[]);

  testimonials.forEach((testimonial, index) => {
    columns[index % columnCount].push(testimonial);
  });

  const loopingColumns = columns.map((column) => {
    if (column.length >= 2) {
      return column;
    }

    const existingIds = new Set(column.map((item) => item.id));
    const fillers = testimonials.filter((item) => !existingIds.has(item.id));
    const augmented = [...column, ...fillers];

    if (augmented.length >= 2) {
      return augmented.slice(0, 2);
    }

    // Fallback: duplicate the only testimonial so marquee still animates
    return column.length === 1 ? [...column, column[0]] : column;
  });

  return (
    <div className="h-full">
      <div className="px-10">
        <div className="relative max-h-[750px] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loopingColumns.map((column, index) => {
              const marqueeConfigs = [
                { className: "[--duration:46s]", reverse: false, repeat: 4 },
                { className: "[--duration:28s]", reverse: false, repeat: 5 },
                { className: "[--duration:80s]", reverse: false, repeat: 4 },
              ];
              const config = marqueeConfigs[index] ?? {
                className: "[--duration:60s]",
                reverse: false,
                repeat: 4,
              };

              return (
                <Marquee
                  vertical
                  key={`column-${index}`}
                  className={cn(config.className)}
                  reverse={config.reverse}
                  repeat={config.repeat}
                >
                  {column.map((card) => (
                    <TestimonialCard {...card} key={card.id} />
                  ))}
                </Marquee>
              );
            })}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/6 md:h-1/5 w-full bg-gradient-to-t from-background from-20%"></div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/6 md:h-1/5 w-full bg-gradient-to-b from-background from-20%"></div>
        </div>
      </div>
    </div>
  );
}
