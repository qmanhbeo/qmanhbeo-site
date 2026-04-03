import Image from "next/image"
import avatarWizardy from "@/img/avt2-wizardy.png"
import { timelineEvents } from "@/utils/sections"

interface AboutSectionProps {
  revealClassName?: string
}

export default function AboutSection({ revealClassName = "" }: AboutSectionProps) {
  return (
    <section
      className="min-w-full h-full relative overflow-hidden section-safe-area
        flex flex-col
        md:flex md:items-center md:justify-center"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-70" />

      <div
        className={`${revealClassName} relative z-10 px-4 sm:px-8 max-w-6xl w-full mx-auto
          flex flex-col gap-3
          md:grid md:grid-cols-2 md:gap-8 md:items-center`}
      >
        {/* Portrait */}
        <div className="flex-shrink-0 flex justify-center pt-4 md:pt-0 md:flex-none md:text-center md:flex-col">
          <div className="rounded-full w-28 h-28 sm:w-40 sm:h-40 md:w-56 md:h-56 overflow-hidden border border-amber-200/20 shadow-[0_0_30px_rgba(255,140,0,0.12)]">
            <Image
              src={avatarWizardy}
              alt="Portrait of Manh"
              width={224}
              height={224}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Parchment card */}
        <div className="relative flex flex-col min-h-0">
          <div
            className="parchment rounded-lg scrollable-content scrollbar-fade overflow-y-auto
              p-3 sm:p-4 md:p-6
              max-h-[calc(100dvh-var(--nav-safe-area)-9rem)]
              md:max-h-[78vh]"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-2 md:mb-4 text-amber-900 font-cinzel">
              The Lore of Leo
            </h2>
            <p className="text-sm md:text-base text-amber-800 mb-3 md:mb-6 font-garamond leading-relaxed italic">
              He is a Vietnamese researcher and builder whose path began in economics and slowly wandered into AI,
              simulations, data systems, and sustainability. What ties it all together is a simple question: how do we
              build tools that stay honest about the world they are meant to serve, especially when resources are scarce,
              trade-offs are real, and people must live with the outcomes?
            </p>

            <div className="space-y-2 md:space-y-3">
              <h3 className="text-lg md:text-xl font-semibold text-amber-900 font-cinzel mb-2 md:mb-3">
                Chronicle of Adventures
              </h3>
              {timelineEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-amber-50 rounded-lg border-l-4 border-amber-600"
                >
                  <span className="text-amber-700 font-bold font-cinzel min-w-[52px] md:min-w-[60px] text-xs md:text-sm pt-0.5">
                    {event.year}
                  </span>
                  <span className="text-amber-800 font-garamond text-xs md:text-sm leading-snug">{event.event}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 md:mt-6 space-y-2 md:space-y-4">
              <h3 className="text-lg md:text-xl font-semibold text-amber-900 font-cinzel">The Path Forward</h3>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                These days, that work takes the shape of reinforcement learning environments, agent-based simulations,
                public data pipelines, and research on sustainability, energy, and equitable resource allocation.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                He is less interested in systems that look clever in a vacuum than in ones that can survive contact with
                institutions, human behaviour, imperfect data, and the friction of ordinary life.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                That is the thread running through the scrolls on this site. AI, economics, and data are not here as
                trophies. They are here because they might help us see trade-offs more clearly, allocate resources more
                wisely, and leave a little more room for fairness than we found.
              </p>
              <div className="text-center mt-4 md:mt-6 pt-3 md:pt-4 border-t border-amber-300">
                <p className="text-amber-600 font-garamond italic text-xs md:text-sm">
                  &quot;The systems worth building are the ones that remember people must live inside their
                  consequences.&quot;
                </p>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 rounded-b-lg bg-gradient-to-t from-[#f5e6c8] to-transparent" />
        </div>
      </div>
    </section>
  )
}
