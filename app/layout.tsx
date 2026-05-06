// app/layout.tsx
import type React from "react"
import type { Metadata, Viewport } from "next"
import { EB_Garamond, Cinzel } from "next/font/google"
import tabIcon from "@/img/tab-icon.png"
import { AudioProvider } from "@/context/AudioContext"
import { WorldProvider } from "@/context/WorldContext"
import AtmosphereControls from "@/components/ui/AtmosphereControls"
import { SITE_URL } from "@/lib/seo"
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Manh | AI, Sustainability, Research & Stories",
    template: "%s | Manh's Cozy Corner",
  },
  description:
    "Personal website of Manh: AI and sustainability research, economic systems, simulations, travel notes, creative projects, and essays by the hearth.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Manh | AI, Sustainability, Research & Stories",
    description:
      "Personal website of Manh: AI and sustainability research, economic systems, simulations, travel notes, creative projects, and essays by the hearth.",
    url: SITE_URL,
    siteName: "By the Hearth",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Manh | AI, Sustainability, Research & Stories",
    description:
      "Personal website of Manh: AI and sustainability research, economic systems, simulations, travel notes, creative projects, and essays by the hearth.",
  },
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
          <WorldProvider>
            <AtmosphereControls />
            {children}
            {modal}
          </WorldProvider>
        </AudioProvider>
      </body>
    </html>
  )
}
