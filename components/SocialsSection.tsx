import { Github, Linkedin, Mail, ScrollText } from "lucide-react"
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
          Connect with Him across the digital realms, where stories continue and friendships are forged
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto mb-12">
          <WoodenMedallion icon={<Github className="w-8 h-8" />} label="GitHub" href="https://github.com/qmanhbeo" />
          <WoodenMedallion
            icon={<Linkedin className="w-8 h-8" />}
            label="LinkedIn"
            href="https://www.linkedin.com/in/qmanhbeo/"
          />
          <WoodenMedallion icon={<ScrollText className="w-8 h-8" />} label="Archive" href="/library" />
          <WoodenMedallion icon={<Mail className="w-8 h-8" />} label="Letter" href="/letter" />
        </div>

        <QuoteScroll
          quote="Somewhere between the campfire and the model, I am still looking for ways to make difficult choices a little wiser and a little fairer."
          author="Manh"
        />
      </div>
    </section>
  )
}
