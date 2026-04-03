import type React from "react"
import type { Metadata, Viewport } from "next"
import { EB_Garamond, Cinzel } from "next/font/google"
import ScrollbarActivityManager from "@/components/ScrollbarActivityManager"
import tabIcon from "@/img/tab-icon.png"
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
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a0a00',
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
      <body className={`${ebGaramond.variable} ${cinzel.variable} antialiased`}>
        <ScrollbarActivityManager />
        {children}
        {modal}
      </body>
    </html>
  )
}
