"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Calculator,
  Settings,
  Receipt,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

const navigation = [
  { name: "VISÃO", href: "/dashboard", icon: LayoutDashboard },
  { name: "VENDAS", href: "/vendas", icon: ShoppingCart },
  { name: "ESTOQUE", href: "/estoque", icon: Package },
  { name: "CUSTOS", href: "/custos", icon: Receipt },
  { name: "PREÇO", href: "/preco", icon: Calculator },
  { name: "PERFIL", href: "/perfil", icon: User },
  { name: "ARQUIVO", href: "/configuracoes", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [userName, setUserName] = useState<string>("")
  const [userPhoto, setUserPhoto] = useState<string>("/placeholder.svg?height=40&width=40")

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("users").select("username, photo_url").eq("id", user.id).single()

        if (profile) {
          setUserName(profile.username || "Usuário")
          if (profile.photo_url && profile.photo_url.startsWith("http")) {
            setUserPhoto(profile.photo_url)
          }
        } else {
          setUserName(user.email?.split("@")[0] || "Usuário")
        }
      }
    }
    fetchUser()

    // Listen for photo updates
    const channel = createClient()
      .channel("photo-updates")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "users" }, (payload) => {
        if (payload.new && typeof payload.new === "object" && "photo_url" in payload.new) {
          const newPhotoUrl = payload.new.photo_url as string
          if (newPhotoUrl && newPhotoUrl.startsWith("http")) {
            setUserPhoto(newPhotoUrl)
          }
        }
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    window.location.href = "/login"
  }

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-700 shadow-md transition-all hover:bg-gray-50 active:scale-95 lg:hidden"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-gray-200 bg-white shadow-xl transition-all duration-300 ease-in-out lg:shadow-none",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          isDesktopCollapsed ? "lg:w-20" : "lg:w-60",
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={cn(
              "flex h-20 items-center border-b border-gray-200 transition-all duration-300",
              isDesktopCollapsed ? "lg:justify-center lg:px-2" : "justify-between px-6",
            )}
          >
            {isDesktopCollapsed ? (
              <div className="hidden lg:flex h-10 w-10 items-center justify-center rounded-lg bg-black text-white font-bold text-sm">
                ES
              </div>
            ) : (
              <Image
                src="https://i.ibb.co/prMLJq5r/Logo-Encanta-store-Preta.png"
                alt="Encanta Store"
                width={120}
                height={48}
                className="object-contain"
                priority
              />
            )}

            <button
              onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
              className={cn(
                "hidden lg:flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700",
                isDesktopCollapsed && "lg:hidden",
              )}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {isDesktopCollapsed && (
              <button
                onClick={() => setIsDesktopCollapsed(false)}
                className="absolute -right-3 top-8 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-700"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                    isActive ? "bg-black text-white shadow-md" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    isDesktopCollapsed && "lg:justify-center lg:px-2",
                  )}
                  title={isDesktopCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className={cn("transition-all duration-300", isDesktopCollapsed && "lg:hidden")}>
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>

          <div className={cn("border-t border-gray-200 p-4", isDesktopCollapsed && "lg:p-2")}>
            <div className={cn("flex items-center gap-3", isDesktopCollapsed && "lg:flex-col lg:gap-2")}>
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                {userPhoto && userPhoto !== "/placeholder.svg?height=40&width=40" ? (
                  <Image
                    src={userPhoto || "/placeholder.svg"}
                    alt={userName}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                    }}
                  />
                ) : (
                  <User className="h-5 w-5 text-gray-500" />
                )}
              </div>

              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center justify-center h-9 rounded-lg text-gray-600 transition-all hover:bg-red-50 hover:text-red-600 ml-auto",
                  isDesktopCollapsed ? "lg:w-9 lg:ml-0" : "w-9",
                )}
                title="Sair"
                aria-label="Fazer logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
