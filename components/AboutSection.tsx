"use client"

import { useState, useRef, useCallback, useEffect } from "react"

const CHRONICLE_SCROLL_KEY = "chronicle:scrollTop"
import Image from "next/image"
import avatarWizardy from "@/img/avt2-wizardy.png"
import { timelineEvents } from "@/utils/sections"

interface AboutSectionProps {
  revealClassName?: string
}

export default function AboutSection({ revealClassName = "" }: AboutSectionProps) {
  const [isAtBottom, setIsAtBottom] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const checkBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setIsAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4)
    try { sessionStorage.setItem(CHRONICLE_SCROLL_KEY, String(el.scrollTop)) } catch { /* noop */ }
  }, [])

  // Restore scroll position on mount
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    try {
      const saved = parseInt(sessionStorage.getItem(CHRONICLE_SCROLL_KEY) ?? "", 10)
      if (!isNaN(saved) && saved > 0) {
        el.scrollTop = saved
        setIsAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4)
      }
    } catch { /* noop */ }
  }, [])

  return (
    <section
      className="min-w-full h-full relative overflow-hidden section-safe-area flex flex-col items-center justify-center"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-70" />

      <div
        className={`${revealClassName} relative z-10 px-4 sm:px-8 max-w-5xl w-full mx-auto
          flex flex-col gap-3
          md:grid md:grid-cols-[auto_1fr] md:gap-6 md:items-center`}
      >
        <div className="flex-shrink-0 flex justify-center pt-4 md:pt-0">
          <div className="rounded-full w-28 h-28 sm:w-40 sm:h-40 md:w-64 md:h-64 overflow-hidden border border-amber-200/20 shadow-[0_0_30px_rgba(255,140,0,0.12)]">
            <Image
              src={avatarWizardy}
              alt="Portrait of Manh"
              width={256}
              height={256}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="relative flex flex-col min-h-0">
          <div
            ref={scrollRef}
            onScroll={checkBottom}
            className="parchment rounded-lg scrollable-content scrollbar-fade overflow-y-auto
              p-3 sm:p-4 md:p-5
              max-h-[calc(100dvh-var(--nav-safe-area)-9rem)]
              md:max-h-[68vh]"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3 text-amber-900 font-cinzel">
              The Chronicle of Leo
            </h2>

            <div className="space-y-3 md:space-y-4">
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                He began in economics, following the promise that the world could be understood through systems and
                incentives.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                That part held. The world could be explained.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                But explanation was never the same as care.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                The systems worked, just not always for the people inside them.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                Over time, the questions shifted. From how things function to who they leave behind. From elegant models
                to the friction of real lives.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                The path wandered into AI, simulations, and data systems, not out of fascination with the tools, but
                with a quieter ambition:
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                can we build systems that don&apos;t quietly fail people?
              </p>
            </div>

            <div className="mt-4 md:mt-5 space-y-1.5 md:space-y-2">
              <h3 className="text-lg md:text-xl font-semibold text-amber-900 font-cinzel mb-1.5 md:mb-2">
                Chronicle of Adventures
              </h3>
              {timelineEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-amber-50 rounded-lg border-l-4 border-amber-600"
                >
                  <span className="text-amber-700 font-bold font-cinzel min-w-[72px] md:min-w-[92px] text-xs md:text-sm pt-0.5">
                    {event.year}
                  </span>
                  <span className="text-amber-800 font-garamond text-xs md:text-sm leading-snug">{event.event}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 md:mt-4 space-y-2 md:space-y-3">
              <h3 className="text-lg md:text-xl font-semibold text-amber-900 font-cinzel">The Path Forward</h3>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                These days, the work lives in reinforcement learning environments, agent-based worlds, and data systems
                shaped by real constraints.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                Not to replace the world as it is, but to understand whether it can be made to hold people better.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                There is no illusion that markets can simply be discarded, nor that optimization alone will solve
                everything.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                But perhaps systems can be designed differently, not just to function, but to catch.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                To make sure falling doesn&apos;t mean disappearing.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                To make sure the basics of living are not left to chance.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                So that people can spend less time surviving, and more time building, creating, and becoming.
              </p>
              <p className="text-sm md:text-base text-amber-800 font-garamond leading-relaxed italic">
                Underneath it all is a simple belief:
              </p>
              <div className="text-center mt-3 md:mt-4 pt-3 border-t border-amber-300">
                <p className="text-amber-600 font-garamond italic text-xs md:text-sm">
                  &quot;the systems worth building are the ones that remember people must live inside their consequences.&quot;
                </p>
              </div>
            </div>
          </div>
          {!isAtBottom && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 rounded-b-lg bg-gradient-to-t from-[#f5e6c8] to-transparent" />
          )}
        </div>
      </div>
    </section>
  )
}
