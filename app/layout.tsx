import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Persona-Based AI Chatbot",
  description: "Chat with three distinct AI personalities: Anshuman, Abhimanyu, and Kshitij",
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {children}
      </body>
    </html>
  )
}
