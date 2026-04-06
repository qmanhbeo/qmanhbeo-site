"use client"

import { Facebook, Github, Instagram, Linkedin } from "lucide-react"
import { useAudioContext } from "@/context/AudioContext"
import WoodenMedallion from "./ui/WoodenMedallion"
import QuoteScroll from "./ui/QuoteScroll"

interface SocialsSectionProps {
  revealClassName?: string
}

export default function SocialsSection({ revealClassName = "" }: SocialsSectionProps) {
  const { playSfx } = useAudioContext()
  return (
    <section
      className="section-safe-area relative flex h-full min-w-full items-center justify-center overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-40" />
      <div className={`${revealClassName} relative z-10 mx-auto w-full max-w-6xl px-4 text-center sm:px-8`}>
        <h2 className="mb-5 font-cinzel text-[2.2rem] font-bold leading-tight text-orange-100 sm:text-5xl md:mb-8 md:text-6xl">
          Join the Fellowship
        </h2>
        <p className="mx-auto mb-8 max-w-xl font-garamond text-[1rem] italic leading-snug text-orange-200 sm:text-lg md:mb-12 md:max-w-2xl md:text-xl md:leading-normal">
          Connect with Him across the digital realms, where stories continue and friendships are forged
        </p>

        <div className="mx-auto mb-5 grid max-w-[20rem] grid-cols-2 gap-4 sm:max-w-md sm:gap-5 md:mb-12 md:max-w-2xl md:grid-cols-4 md:gap-8">
          <WoodenMedallion
            icon={<Github className="h-6 w-6 md:h-8 md:w-8" />}
            label="GitHub"
            href="https://github.com/qmanhbeo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSfx("click")}
          />
          <WoodenMedallion
            icon={<Linkedin className="h-6 w-6 md:h-8 md:w-8" />}
            label="LinkedIn"
            href="https://www.linkedin.com/in/qmanhbeo/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSfx("click")}
          />
          <WoodenMedallion
            icon={<Facebook className="h-6 w-6 md:h-8 md:w-8" />}
            label="Facebook"
            href="https://www.facebook.com/qmanhbeo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSfx("click")}
          />
          <WoodenMedallion
            icon={<Instagram className="h-6 w-6 md:h-8 md:w-8" />}
            label="Instagram"
            href="https://www.instagram.com/qmanhbeo/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSfx("click")}
          />
        </div>

        <QuoteScroll
          className="mt-2 md:mt-0"
          quote={`Let me help
because it's the right thing to do.
- Manh`}
        />
      </div>
    </section>
  )
}
