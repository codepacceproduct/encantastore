import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Encanta Store - Sistema de Gestão",
  description: "Sistema de gestão completo para loja de moda feminina",
  generator: "v0.app",
  icons: {
    icon: "https://i.ibb.co/prMLJq5r/Logo-Encanta-store-Preta.png",
    shortcut: "https://i.ibb.co/prMLJq5r/Logo-Encanta-store-Preta.png",
    apple: "https://i.ibb.co/prMLJq5r/Logo-Encanta-store-Preta.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
