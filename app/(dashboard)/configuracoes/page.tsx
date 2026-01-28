"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCategories, createCategory, deleteCategory, getSizes, createSize, deleteSize } from "@/lib/db"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2 } from "lucide-react"
import type { Category, Size } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ConfiguracoesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [newSize, setNewSize] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()

    const supabase = createClient()
    const channel = supabase
      .channel("realtime-config")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "sizes" }, loadData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadData() {
    setIsLoading(true)
    const [categoriesData, sizesData] = await Promise.all([getCategories(), getSizes()])
    setCategories(categoriesData)
    setSizes(sizesData)
    setIsLoading(false)
  }

  async function handleAddCategory() {
    if (!newCategory.trim()) {
      toast({ title: "Erro", description: "Digite um nome para a categoria", variant: "destructive" })
      return
    }

    const result = await createCategory({ name: newCategory.trim() })

    if (result) {
      await loadData()
      setNewCategory("")
      toast({ title: "Sucesso", description: "Categoria adicionada" })
    } else {
      toast({ title: "Erro", description: "Erro ao adicionar categoria", variant: "destructive" })
    }
  }

  async function handleDeleteCategory(id: string) {
    const result = await deleteCategory(id)
    if (result) {
      await loadData()
      toast({ title: "Removido", description: "Categoria removida" })
    }
  }

  async function handleAddSize() {
    if (!newSize.trim()) {
      toast({ title: "Erro", description: "Digite um nome para o tamanho", variant: "destructive" })
      return
    }

    const result = await createSize({ name: newSize.trim(), sort_order: 0 })

    if (result) {
      await loadData()
      setNewSize("")
      toast({ title: "Sucesso", description: "Tamanho adicionado" })
    } else {
      toast({ title: "Erro", description: "Erro ao adicionar tamanho", variant: "destructive" })
    }
  }

  async function handleDeleteSize(id: string) {
    const result = await deleteSize(id)
    if (result) {
      await loadData()
      toast({ title: "Removido", description: "Tamanho removido" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Carregando configurações...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-black">Configurações Básicas</h1>
        <p className="mt-1 text-sm text-gray-500">Categorias e tamanhos</p>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="categories">CATEGORIAS</TabsTrigger>
          <TabsTrigger value="sizes">TAMANHOS</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <Card className="border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">Adicionar Categoria</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Biquíni, Maiô, Saída de Praia"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              />
              <Button onClick={handleAddCategory} className="bg-black text-white hover:bg-black/90">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <div className="divide-y divide-gray-200">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-6">
                  <span className="font-medium text-black">{category.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sizes" className="space-y-6">
          <Card className="border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500">Adicionar Tamanho</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: P, M, G, GG, XG"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSize()}
              />
              <Button onClick={handleAddSize} className="bg-black text-white hover:bg-black/90">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </Card>

          <Card className="border border-gray-200 bg-white">
            <div className="grid grid-cols-3 gap-4 p-6">
              {sizes.map((size) => (
                <div key={size.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <span className="font-medium text-black">{size.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSize(size.id)}
                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
