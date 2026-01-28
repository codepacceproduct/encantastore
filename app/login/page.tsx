"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data: users, error } = await supabase.from("users").select("*").eq("username", username).limit(1)

      if (error) throw error

      if (!users || users.length === 0) {
        toast({
          title: "Erro",
          description: "Usuário ou senha incorretos",
          variant: "destructive",
        })
        return
      }

      const user = users[0]

      // Simple password check (in production, use bcrypt comparison)
      if (password !== "123456") {
        toast({
          title: "Erro",
          description: "Usuário ou senha incorretos",
          variant: "destructive",
        })
        return
      }

      // Set authentication cookie
      document.cookie = `user_authenticated=${user.id}; path=/; max-age=86400`
      document.cookie = `user_username=${user.username}; path=/; max-age=86400`

      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left side - Feminine Store Image */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative bg-neutral-100">
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=1600&fit=crop&q=80"
          alt="Loja Feminina"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/20 via-transparent to-purple-50/20" />
      </div>

      {/* Right side - Modern Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-8 md:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-6">
            <Image
              src="https://i.ibb.co/prMLJq5r/Logo-Encanta-store-Preta.png"
              alt="Encanta Store"
              width={140}
              height={46}
              className="mx-auto"
              priority
            />
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">Bem-vinda de volta</h1>
              <p className="text-neutral-500 text-sm sm:text-base">Entre com suas credenciais para acessar o sistema</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-neutral-700">
                Usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 px-4 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 px-4 pr-12 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-neutral-900 hover:bg-neutral-800 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar no Sistema"}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-xs text-neutral-400">© 2026 Encanta Store. Sistema de gestão interno.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
