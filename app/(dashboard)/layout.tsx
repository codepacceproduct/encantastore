import type React from "react"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="transition-all duration-300 lg:ml-60">{children}</main>
    </div>
  )
}
