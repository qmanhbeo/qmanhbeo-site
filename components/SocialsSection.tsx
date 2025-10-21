import { Github, Linkedin, Instagram, Mail } from "lucide-react"
import WoodenMedallion from "./ui/WoodenMedallion"
import QuoteScroll from "./ui/QuoteScroll"

export default function SocialsSection() {
  return (
    <section
      className="min-w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-40" />
      <div className="relative z-10 text-center px-8 max-w-4xl">
        <h2 className="text-5xl md:text-6xl font-bold mb-8 text-orange-100 font-cinzel">Join the Fellowship</h2>
        <p className="text-xl text-orange-200 mb-12 max-w-2xl mx-auto font-garamond italic">
          Connect with me across the digital realms, where stories continue and friendships are forged
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto mb-12">
          <WoodenMedallion icon={<Github className="w-8 h-8" />} label="GitHub" href="#" />
          <WoodenMedallion icon={<Linkedin className="w-8 h-8" />} label="LinkedIn" href="#" />
          <WoodenMedallion icon={<Instagram className="w-8 h-8" />} label="Instagram" href="#" />
          <WoodenMedallion icon={<Mail className="w-8 h-8" />} label="Email" href="#" />
        </div>

        <QuoteScroll
          quote="The fire may dim, but the stories we share keep the warmth alive. Until we meet again by the digital hearth..."
          author="Manh"
        />
      </div>
    </section>
  )
}
