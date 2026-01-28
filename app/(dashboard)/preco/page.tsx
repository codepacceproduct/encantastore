"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getVariableCosts } from "@/lib/db"
import { createClient } from "@/lib/supabase/client"
import { Calculator } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { VariableCost } from "@/lib/types"

const MARGINS = [50, 60, 80]

export default function PrecoPage() {
  const [productCost, setProductCost] = useState<number>(0)
  const [variableCosts, setVariableCosts] = useState<VariableCost[]>([])
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadVariableCosts() {
      const data = await getVariableCosts()
      setVariableCosts(data.filter((c) => c.status === "active"))
      setIsLoading(false)
    }
    loadVariableCosts()

    const supabase = createClient()
    const channel = supabase
      .channel("realtime-pricing")
      .on("postgres_changes", { event: "*", schema: "public", table: "variable_costs" }, () => {
        loadVariableCosts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const totalExtras = Array.from(selectedExtras).reduce((sum, id) => {
    const cost = variableCosts.find((c) => c.id === id)
    return sum + (cost?.value || 0)
  }, 0)

  function calculatePrice(margin: number) {
    const profit = productCost * (margin / 100)
    return productCost + profit + totalExtras
  }

  function toggleExtra(id: string) {
    const newSet = new Set(selectedExtras)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedExtras(newSet)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Carregando calculadora...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-black">Calculadora de Preço</h1>
        <p className="mt-1 text-sm text-gray-500">Simulação de margem e precificação</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card className="border border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-gray-600" />
              <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500">Dados de Entrada</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="productCost">Custo do Produto (R$)</Label>
                <Input
                  type="number"
                  id="productCost"
                  step="0.01"
                  min="0"
                  value={productCost || ""}
                  onChange={(e) => setProductCost(Number.parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="text-lg"
                />
              </div>

              {variableCosts.length > 0 && (
                <div>
                  <Label className="mb-3 block">Custos Extras (Opcionais)</Label>
                  <div className="space-y-3 rounded-lg border border-gray-200 p-4">
                    {variableCosts.map((cost) => (
                      <div key={cost.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={cost.id}
                            checked={selectedExtras.has(cost.id)}
                            onCheckedChange={() => toggleExtra(cost.id)}
                          />
                          <label htmlFor={cost.id} className="text-sm font-medium text-gray-700">
                            {cost.name}
                          </label>
                        </div>
                        <span className="text-sm text-gray-600">R$ {cost.value.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Total extras: R$ {totalExtras.toFixed(2)}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500">Margens Sugeridas</h3>

          {MARGINS.map((margin) => {
            const finalPrice = calculatePrice(margin)
            const profit = productCost * (margin / 100)

            return (
              <Card key={margin} className="border border-gray-200 bg-white p-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <span className="text-sm font-medium uppercase tracking-wider text-gray-500">Margem {margin}%</span>
                  <span className="text-3xl font-bold text-green-600">R$ {finalPrice.toFixed(2)}</span>
                </div>
                <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Custo do produto:</span>
                    <span className="font-medium text-black">R$ {productCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lucro ({margin}%):</span>
                    <span className="font-medium text-green-600">R$ {profit.toFixed(2)}</span>
                  </div>
                  {totalExtras > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custos extras:</span>
                      <span className="font-medium text-black">R$ {totalExtras.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold">
                    <span className="text-black">Preço final:</span>
                    <span className="text-green-600">R$ {finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
