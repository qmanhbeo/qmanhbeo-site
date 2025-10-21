"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Send, Feather } from "lucide-react"

export default function LetterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [letterSent, setLetterSent] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLetterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setLetterSent(true)

    // Reset form after showing confirmation
    setTimeout(() => {
      setLetterSent(false)
      setFormData({ name: "", email: "", message: "" })
    }, 5000)
  }

  return (
    <div className="min-h-screen forest-campfire">
      {/* Warm candlelit overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/30" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 medieval-button text-orange-100 px-6 py-3 rounded-lg font-garamond mb-8 hover:ember-glow transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Hearth
          </Link>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-orange-100 font-cinzel">Write Me a Letter</h1>
          <p className="text-lg md:text-xl text-orange-200 max-w-2xl mx-auto font-garamond italic leading-relaxed">
            In this age of fleeting messages, let us return to the art of thoughtful correspondence
          </p>
        </div>

        {/* Writing Desk */}
        <div className="max-w-4xl mx-auto">
          <div className="writing-desk">
            {/* Desk Surface */}
            <div className="desk-surface">
              {/* Decorative Elements */}
              <div className="desk-decorations">
                <div className="inkwell" />
                <div className="quill-holder">
                  <Feather className="w-6 h-6 text-amber-700 transform rotate-45" />
                </div>
                <div className="candle">
                  <div className="candle-flame flickering" />
                </div>
              </div>

              {/* Letter Parchment */}
              <div className="letter-parchment-large">
                {!letterSent ? (
                  <form className="letter-form" onSubmit={handleLetterSubmit}>
                    {/* Greeting */}
                    <div className="letter-greeting">
                      <p className="text-amber-800 font-garamond italic text-lg mb-6">Dear Fellow Wanderer,</p>
                    </div>

                    {/* Form Fields */}
                    <div className="form-fields space-y-6">
                      <div className="form-group">
                        <label className="form-label font-cinzel font-semibold text-amber-900">
                          Your Name, Fellow Traveler
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="quill-input"
                          placeholder="By what name shall I know you?"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label font-cinzel font-semibold text-amber-900">
                          Your Message to the Hearth
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={8}
                          className="quill-textarea"
                          placeholder="Share your thoughts, dreams, questions, or simply say hello..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label font-cinzel font-semibold text-amber-900">
                          Where Shall I Send My Reply?
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="quill-input"
                          placeholder="your.email@realm.com"
                        />
                      </div>
                    </div>

                    {/* Closing */}
                    <div className="letter-closing mt-8">
                      <p className="text-amber-800 font-garamond italic mb-6">
                        With warm regards and anticipation of your words,
                      </p>
                    </div>

                    {/* Send Button */}
                    <div className="text-center">
                      <button type="submit" disabled={isSubmitting} className="send-letter-button group">
                        <div className="button-content">
                          {isSubmitting ? (
                            <>
                              <div className="loading-quill">🪶</div>
                              <span>Sealing with wax...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 group-hover:transform group-hover:translate-x-1 transition-transform" />
                              <span>Send Letter</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Success Message */
                  <div className="letter-sent-message">
                    <div className="success-seal">
                      <div className="seal-animation">✉</div>
                    </div>
                    <h3 className="text-2xl font-bold text-amber-900 mb-4 font-cinzel text-center">
                      Letter Dispatched!
                    </h3>
                    <p className="text-amber-800 font-garamond italic text-lg text-center leading-relaxed">
                      Your words have taken flight on digital wings. May our paths cross again, where stories meet by
                      the warmth of the hearth.
                    </p>
                    <div className="text-center mt-6">
                      <div className="inline-block px-4 py-2 bg-amber-200 rounded-full">
                        <span className="text-amber-800 font-garamond text-sm">I'll reply within a few days ✨</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
