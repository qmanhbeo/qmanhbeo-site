export default function HeroSection() {
  return (
    <section
      className="min-w-full h-full flex items-center justify-center relative overflow-hidden section-safe-area"
      style={{ scrollSnapAlign: "start" }}
    >
      <div className="firelight absolute inset-0" />
      <div className="relative z-10 text-center px-8 max-w-4xl content-container">
        <div className="flickering mb-8">
          <div className="w-16 h-20 mx-auto bg-gradient-to-t from-orange-600 via-orange-400 to-yellow-300 rounded-t-full relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-gradient-to-t from-orange-500 to-yellow-200 rounded-t-full opacity-80"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-t from-orange-400 to-yellow-100 rounded-t-full opacity-60"></div>
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-6 text-orange-100 font-cinzel">Hi, I'm Manh</h1>
        <p className="text-xl md:text-2xl mb-8 text-orange-200 max-w-2xl mx-auto leading-relaxed font-garamond italic">
          Welcome to my cozy little corner of the web, where stories unfold and digital dreams take shape by the warmth
          of code.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="medieval-button text-orange-100 font-semibold px-8 py-3 rounded-lg font-garamond">
            Explore My Tales
          </button>
          <button className="medieval-button text-orange-100 font-semibold px-8 py-3 rounded-lg font-garamond">
            Join the Hearth
          </button>
        </div>

        
      </div>
    </section>
  )
}
