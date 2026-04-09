// app/layout.tsx
import type React from "react"
import type { Metadata, Viewport } from "next"
import { EB_Garamond, Cinzel } from "next/font/google"
import tabIcon from "@/img/tab-icon.png"
import { AudioProvider } from "@/context/AudioContext"
import { FunModeProvider } from "@/context/FunModeContext"
import AtmosphereControls from "@/components/ui/AtmosphereControls"
import "./globals.css"

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
})

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a0a00",
}

export const metadata: Metadata = {
  title: "Manh's Cozy Corner",
  description: "A medieval-inspired personal website",
  icons: {
    icon: tabIcon.src,
    shortcut: tabIcon.src,
  },
}

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme:pref');if(t==='light')document.documentElement.setAttribute('data-theme','light')}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${ebGaramond.variable} ${cinzel.variable} antialiased`}>
        <AudioProvider>
          <FunModeProvider>
            <AtmosphereControls />
            {children}
            {modal}
          </FunModeProvider>
        </AudioProvider>
      </body>
    </html>
  )
}
