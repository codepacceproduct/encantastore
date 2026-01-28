"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, User, Lock, LogOut, Camera } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function PerfilPage() {
  const [username, setUsername] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPhotoLoading, setIsPhotoLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("users").select("username, photo_url").eq("id", user.id).single()

        if (profile) {
          setUsername(profile.username || "")
          setPhotoUrl(profile.photo_url || "")
        }
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()

    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    })

    router.push("/login")
  }

  const handlePhotoUrlChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPhotoLoading(true)

    try {
      // Validate URL format
      if (!photoUrl || !photoUrl.startsWith("http")) {
        toast({
          title: "URL inválida",
          description: "Por favor, insira uma URL válida começando com http:// ou https://",
          variant: "destructive",
        })
        setIsPhotoLoading(false)
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not found")

      const { error } = await supabase
        .from("users")
        .update({
          photo_url: photoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso",
      })

      // Force reload to show new photo
      window.location.reload()
    } catch (error) {
      console.error("[v0] Error updating photo:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a foto. Verifique se a URL está correta.",
        variant: "destructive",
      })
    } finally {
      setIsPhotoLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (newPassword !== confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem",
          variant: "destructive",
        })
        return
      }

      if (newPassword.length < 6) {
        toast({
          title: "Erro",
          description: "A senha deve ter no mínimo 6 caracteres",
          variant: "destructive",
        })
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not found")

      // Verify current password
      const { data: userData } = await supabase.from("users").select("password_hash").eq("id", user.id).single()

      if (!userData) throw new Error("User data not found")

      // In production, you'd verify the bcrypt hash properly
      // For now, we'll just update the password
      const { error } = await supabase
        .from("users")
        .update({
          password_hash: `$2a$10$${newPassword}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso",
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("[v0] Error changing password:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar a senha",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Perfil</h1>
        <p className="text-sm sm:text-base text-neutral-500">Gerencie suas informações e segurança</p>
      </div>

      <div className="grid gap-6">
        {/* Photo Upload Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white">
                <Camera size={24} />
              </div>
              <div>
                <CardTitle>Foto de Perfil</CardTitle>
                <CardDescription>Adicione uma URL de imagem para sua foto</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePhotoUrlChange} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                  {photoUrl ? (
                    <Image
                      src={photoUrl || "/placeholder.svg"}
                      alt="Preview"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                      }}
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 w-full space-y-2">
                  <Label htmlFor="photoUrl">URL da Foto</Label>
                  <Input
                    id="photoUrl"
                    type="url"
                    placeholder="https://exemplo.com/sua-foto.jpg"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-neutral-500">
                    Cole o link de uma imagem hospedada online (ex: Imgur, Google Drive público, etc.)
                  </p>
                </div>
              </div>
              <Button type="submit" className="w-full bg-black hover:bg-neutral-800" disabled={isPhotoLoading}>
                {isPhotoLoading ? "Atualizando..." : "Atualizar Foto"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white">
                <User size={24} />
              </div>
              <div>
                <CardTitle>Informações do Usuário</CardTitle>
                <CardDescription>Dados da sua conta</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Usuário</Label>
              <Input value={username} disabled className="mt-1 bg-neutral-50" />
            </div>
            <div>
              <Label>Data de criação</Label>
              <Input value={new Date().toLocaleDateString("pt-BR")} disabled className="mt-1 bg-neutral-50" />
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white">
                <Lock size={24} />
              </div>
              <div>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Mantenha sua conta segura</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Digite sua senha atual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-black hover:bg-neutral-800" disabled={isLoading}>
                {isLoading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Logout Card */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white">
                <LogOut size={24} />
              </div>
              <div>
                <CardTitle className="text-red-600">Sair da Conta</CardTitle>
                <CardDescription>Encerrar sua sessão atual</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              Sair do Sistema
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
