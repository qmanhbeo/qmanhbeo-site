import { timelineEvents } from "@/utils/sections"

export default function AboutSection() {
  return (
    <section
      className="min-w-full h-full flex items-center justify-center relative overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0 opacity-70" />
      <div className="relative z-10 px-8 max-w-6xl w-full h-full flex items-center">
        <div className="grid md:grid-cols-2 gap-8 items-center w-full">
          {/* Left side - Smaller image */}
          <div className="text-center flex flex-col justify-center">
            <div className="wooden-frame rounded-full w-56 h-56 mx-auto overflow-hidden">
              <img
                src="/placeholder.svg?height=224&width=224"
                alt="Portrait of Manh"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right side - Fixed height scrollable parchment */}
          <div className="flex flex-col justify-center">
            <div className="parchment p-6 rounded-lg scrollable-content max-h-[60vh] overflow-y-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900 font-cinzel">The Lore of Manh</h2>
              <p className="text-base text-amber-800 mb-6 font-garamond leading-relaxed italic">
                In the quiet hours of night, by firelight and thought, Manh weaves stories from both silicon and soul. A
                Vietnamese wanderer, builder, and researcher, he blends AI, sustainability, philosophy, and poetry into
                a life lived across realms — digital and real. Some know him as an economist; others, a storyteller; but
                to himself, he's simply someone searching for warmth, clarity, and meaning.
              </p>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-amber-900 font-cinzel mb-3">Chronicle of Adventures</h3>
                {timelineEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-600"
                  >
                    <span className="text-amber-700 font-bold font-cinzel min-w-[60px] text-sm">{event.year}</span>
                    <span className="text-amber-800 font-garamond text-sm">{event.event}</span>
                  </div>
                ))}
              </div>

              {/* Additional content to demonstrate scrolling */}
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-semibold text-amber-900 font-cinzel">The Path Forward</h3>
                <p className="text-base text-amber-800 font-garamond leading-relaxed italic">
                  As the digital realm continues to evolve, so too does the journey of discovery. Each line of code
                  written, each algorithm crafted, and each story told adds another chapter to this ongoing tale of
                  exploration and growth.
                </p>
                <p className="text-base text-amber-800 font-garamond leading-relaxed italic">
                  The intersection of technology and humanity remains a fascinating frontier, where ancient wisdom meets
                  modern innovation, and where the warmth of human connection illuminates even the most complex digital
                  landscapes.
                </p>
                <p className="text-base text-amber-800 font-garamond leading-relaxed italic">
                  Through years of wandering both physical and digital realms, the stories collected along the way form
                  a tapestry of experiences that continue to shape and inspire new adventures.
                </p>
                <div className="text-center mt-6 pt-4 border-t border-amber-300">
                  <p className="text-amber-600 font-garamond italic text-sm">
                    "In every algorithm lies a story, in every story lies a truth."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
