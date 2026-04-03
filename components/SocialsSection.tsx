import { Facebook, Github, Instagram, Linkedin } from "lucide-react"
import WoodenMedallion from "./ui/WoodenMedallion"
import QuoteScroll from "./ui/QuoteScroll"

interface SocialsSectionProps {
  revealClassName?: string
}

export default function SocialsSection({ revealClassName = "" }: SocialsSectionProps) {
  return (
    <section
      className="min-w-full h-full flex items-center justify-center relative overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-40" />
      <div className={`${revealClassName} relative z-10 text-center px-4 sm:px-8 max-w-6xl w-full mx-auto`}>
        <h2 className="font-cinzel text-4xl font-bold mb-8 text-orange-100 sm:text-5xl md:text-6xl">Join the Fellowship</h2>
        <p className="text-xl text-orange-200 mb-12 max-w-2xl mx-auto font-garamond italic">
          Connect with Him across the digital realms, where stories continue and friendships are forged
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto mb-6 md:mb-12">
          <WoodenMedallion
            icon={<Github className="w-8 h-8" />}
            label="GitHub"
            href="https://github.com/qmanhbeo"
            target="_blank"
            rel="noopener noreferrer"
          />
          <WoodenMedallion
            icon={<Linkedin className="w-8 h-8" />}
            label="LinkedIn"
            href="https://www.linkedin.com/in/qmanhbeo/"
            target="_blank"
            rel="noopener noreferrer"
          />
          <WoodenMedallion
            icon={<Facebook className="w-8 h-8" />}
            label="Facebook"
            href="https://www.facebook.com/qmanhbeo"
            target="_blank"
            rel="noopener noreferrer"
          />
          <WoodenMedallion
            icon={<Instagram className="w-8 h-8" />}
            label="Instagram"
            href="https://www.instagram.com/qmanhbeo/"
            target="_blank"
            rel="noopener noreferrer"
          />
        </div>

        <QuoteScroll
          quote="Somewhere between the campfire and the model, I am still looking for ways to make difficult choices a little wiser and a little fairer."
          author="Manh"
        />
      </div>
    </section>
  )
}
