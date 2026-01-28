"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getFixedCosts,
  createFixedCost,
  deleteFixedCost,
  getVariableCosts,
  createVariableCost,
  deleteVariableCost,
} from "@/lib/db"
import { Plus, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { FixedCost, VariableCost } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"

export default function CustosPage() {
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([])
  const [variableCosts, setVariableCosts] = useState<VariableCost[]>([])
  const [isFixedDialogOpen, setIsFixedDialogOpen] = useState(false)
  const [isVariableDialogOpen, setIsVariableDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadCosts()

    const supabase = createClient()
    const channel = supabase
      .channel("realtime-costs")
      .on("postgres_changes", { event: "*", schema: "public", table: "fixed_costs" }, loadCosts)
      .on("postgres_changes", { event: "*", schema: "public", table: "variable_costs" }, loadCosts)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadCosts() {
    setIsLoading(true)
    const [fixed, variable] = await Promise.all([getFixedCosts(), getVariableCosts()])
    setFixedCosts(fixed)
    setVariableCosts(variable)
    setIsLoading(false)
  }

  async function handleAddFixedCost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const monthlyValue = Number.parseFloat(formData.get("monthlyValue") as string)

    if (!name || !monthlyValue) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" })
      return
    }

    const result = await createFixedCost({ name, monthly_value: monthlyValue, status: "active" })

    if (result) {
      await loadCosts()
      setIsFixedDialogOpen(false)
      toast({ title: "Sucesso", description: "Custo fixo adicionado" })
    } else {
      toast({ title: "Erro", description: "Erro ao adicionar custo", variant: "destructive" })
    }
  }

  async function handleAddVariableCost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const value = Number.parseFloat(formData.get("value") as string)

    if (!name || !value) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" })
      return
    }

    const result = await createVariableCost({ name, value, status: "active" })

    if (result) {
      await loadCosts()
      setIsVariableDialogOpen(false)
      toast({ title: "Sucesso", description: "Custo variável adicionado" })
    } else {
      toast({ title: "Erro", description: "Erro ao adicionar custo", variant: "destructive" })
    }
  }

  async function handleDeleteFixedCost(id: string) {
    const result = await deleteFixedCost(id)
    if (result) {
      await loadCosts()
      toast({ title: "Removido", description: "Custo fixo removido" })
    }
  }

  async function handleDeleteVariableCost(id: string) {
    const result = await deleteVariableCost(id)
    if (result) {
      await loadCosts()
      toast({ title: "Removido", description: "Custo variável removido" })
    }
  }

  const totalFixed = fixedCosts.filter((c) => c.status === "active").reduce((sum, c) => sum + c.monthly_value, 0)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Carregando custos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-black">Gestão de Custos</h1>
        <p className="mt-1 text-sm text-gray-500">Controle financeiro automatizado</p>
      </div>

      {/* Summary Card */}
      <Card className="mb-6 border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Fixo Recorrente</span>
            <p className="mt-2 text-3xl font-semibold text-black">R$ {totalFixed.toFixed(2)}</p>
            <p className="mt-1 text-xs text-gray-500">Vendas brutas no período</p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="fixed" className="space-y-6">
        <TabsList>
          <TabsTrigger value="fixed">CUSTOS FIXOS</TabsTrigger>
          <TabsTrigger value="variable">CUSTOS VARIÁVEIS</TabsTrigger>
        </TabsList>

        <TabsContent value="fixed" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isFixedDialogOpen} onOpenChange={setIsFixedDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-black/90">
                  <Plus className="mr-2 h-4 w-4" />
                  NOVO CUSTO FIXO
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Custo Fixo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddFixedCost} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input type="text" name="name" placeholder="Ex: Aluguel, Energia" required />
                  </div>
                  <div>
                    <Label htmlFor="monthlyValue">Valor Mensal (R$)</Label>
                    <Input type="number" name="monthlyValue" step="0.01" min="0" required />
                  </div>
                  <Button type="submit" className="w-full bg-black text-white hover:bg-black/90">
                    Adicionar
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {fixedCosts.length === 0 ? (
            <Card className="border border-gray-200 bg-white p-12">
              <div className="text-center">
                <p className="text-sm text-gray-500">Nenhum custo fixo cadastrado.</p>
              </div>
            </Card>
          ) : (
            <Card className="border border-gray-200 bg-white">
              <div className="divide-y divide-gray-200">
                {fixedCosts.map((cost) => (
                  <div key={cost.id} className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-black">{cost.name}</p>
                        <Badge variant={cost.status === "active" ? "default" : "secondary"} className="mt-1">
                          {cost.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-black">R$ {cost.monthly_value.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFixedCost(cost.id)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="variable" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isVariableDialogOpen} onOpenChange={setIsVariableDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black text-white hover:bg-black/90">
                  <Plus className="mr-2 h-4 w-4" />
                  NOVO CUSTO VARIÁVEL
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Custo Variável</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddVariableCost} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input type="text" name="name" placeholder="Ex: Sacola, Etiqueta" required />
                  </div>
                  <div>
                    <Label htmlFor="value">Valor Unitário (R$)</Label>
                    <Input type="number" name="value" step="0.01" min="0" required />
                  </div>
                  <Button type="submit" className="w-full bg-black text-white hover:bg-black/90">
                    Adicionar
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {variableCosts.length === 0 ? (
            <Card className="border border-gray-200 bg-white p-12">
              <div className="text-center">
                <p className="text-sm text-gray-500">Nenhum custo variável cadastrado.</p>
              </div>
            </Card>
          ) : (
            <Card className="border border-gray-200 bg-white">
              <div className="divide-y divide-gray-200">
                {variableCosts.map((cost) => (
                  <div key={cost.id} className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-black">{cost.name}</p>
                        <Badge variant={cost.status === "active" ? "default" : "secondary"} className="mt-1">
                          {cost.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-black">R$ {cost.value.toFixed(2)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteVariableCost(cost.id)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
