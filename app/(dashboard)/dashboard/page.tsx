"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSales, getProducts, getProductSizes, getAllProductSizes } from "@/lib/db"
import { createClient } from "@/lib/supabase/client"
import { DollarSign, ShoppingBag, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type PeriodFilter = "7" | "30" | "custom"

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodFilter>("7")
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({})
  const [metrics, setMetrics] = useState({
    revenue: 0,
    salesCount: 0,
    costs: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [lowStock, setLowStock] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    calculateMetrics()

    const supabase = createClient()
    const channel = supabase
      .channel("realtime-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales" }, () => {
        calculateMetrics()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        calculateMetrics()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "product_variants" }, () => {
        calculateMetrics()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [period, customRange])

  function getDateRange() {
    const now = new Date()
    if (period === "7") {
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
    } else if (period === "30") {
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) }
    } else {
      return {
        from: customRange.from ? startOfDay(customRange.from) : startOfDay(now),
        to: customRange.to ? endOfDay(customRange.to) : endOfDay(now),
      }
    }
  }

  async function calculateMetrics() {
    setIsLoading(true)
    const sales = await getSales()
    const products = await getProducts()
    const productSizes = await getAllProductSizes()

    const { from, to } = getDateRange()

    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.sale_date)
      return isWithinInterval(saleDate, { start: from, end: to })
    })

    const revenue = filteredSales.reduce((sum, sale) => sum + sale.total_value, 0)
    const salesCount = filteredSales.length
    const costs = filteredSales.reduce((sum, sale) => {
      const product = products.find((p) => p.id === sale.product_id)
      return sum + (product?.cost || 0) * sale.quantity
    }, 0)

    setMetrics({ revenue, salesCount, costs })

    const days = period === "7" ? 7 : period === "30" ? 30 : 7
    const chartPoints = []
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(to, i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)
      const daySales = filteredSales.filter((sale) =>
        isWithinInterval(new Date(sale.sale_date), { start: dayStart, end: dayEnd }),
      )
      const dayRevenue = daySales.reduce((sum, sale) => sum + sale.total_value, 0)
      chartPoints.push({
        date: format(date, "dd/MMM", { locale: ptBR }),
        value: dayRevenue,
      })
    }
    setChartData(chartPoints)

    const productSalesMap = new Map<string, { name: string; quantity: number }>()
    filteredSales.forEach((sale) => {
      const existing = productSalesMap.get(sale.product_id)
      if (existing) {
        existing.quantity += sale.quantity
      } else {
        productSalesMap.set(sale.product_id, { name: sale.product_name, quantity: sale.quantity })
      }
    })
    const topProductsArray = Array.from(productSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
    setTopProducts(topProductsArray)

    const lowStockItems = productSizes
      .filter((ps) => ps.stock_quantity < 3 && ps.stock_quantity >= 0)
      .map((ps) => {
        const product = products.find((p) => p.id === ps.product_id)
        return {
          name: product?.name || "Unknown",
          size: ps.size_name,
          quantity: ps.stock_quantity,
        }
      })
    setLowStock(lowStockItems)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Carregando dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black sm:text-3xl">Painel de Controle</h1>
          <p className="mt-1 text-sm text-gray-500">Visão geral da operação</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={period === "7" ? "default" : "outline"}
            onClick={() => setPeriod("7")}
            className={cn(period === "7" && "bg-black text-white hover:bg-black/90", "text-xs sm:text-sm")}
          >
            7 DIAS
          </Button>
          <Button
            variant={period === "30" ? "default" : "outline"}
            onClick={() => setPeriod("30")}
            className={cn(period === "30" && "bg-black text-white hover:bg-black/90", "text-xs sm:text-sm")}
          >
            30 DIAS
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={period === "custom" ? "default" : "outline"}
                className={cn(period === "custom" && "bg-black text-white hover:bg-black/90", "text-xs sm:text-sm")}
              >
                CUSTOM
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: customRange.from, to: customRange.to }}
                onSelect={(range) => {
                  setCustomRange({ from: range?.from, to: range?.to })
                  setPeriod("custom")
                }}
                numberOfMonths={2}
                className="hidden sm:block"
              />
              <Calendar
                mode="range"
                selected={{ from: customRange.from, to: customRange.to }}
                onSelect={(range) => {
                  setCustomRange({ from: range?.from, to: range?.to })
                  setPeriod("custom")
                }}
                numberOfMonths={1}
                className="block sm:hidden"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        <Card className="border border-gray-200 bg-white p-4 sm:p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Receita Total</span>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-black sm:text-3xl">R$ {metrics.revenue.toFixed(2)}</p>
          <p className="mt-1 text-xs text-gray-500">Vendas brutas no período</p>
        </Card>

        <Card className="border border-gray-200 bg-white p-4 sm:p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Vendas Realizadas</span>
            <ShoppingBag className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-black sm:text-3xl">{metrics.salesCount}</p>
          <p className="mt-1 text-xs text-gray-500">Pedidos confirmados</p>
        </Card>

        <Card className="border border-gray-200 bg-white p-4 sm:p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Custos (CMV)</span>
            <TrendingDown className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-black sm:text-3xl">R$ {metrics.costs.toFixed(2)}</p>
          <p className="mt-1 text-xs text-gray-500">Custo dos produtos vendidos</p>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <Card className="border border-gray-200 bg-white p-4 sm:p-6">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500 sm:mb-6">Gráfico de Vendas</h3>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#999" className="sm:text-xs" />
              <YAxis tick={{ fontSize: 10 }} stroke="#999" className="sm:text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Low Stock Alert */}
        <Card className="border border-gray-200 bg-white p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2 sm:mb-6">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500">Alerta de Estoque Baixo</h3>
          </div>
          <div className="max-h-[250px] space-y-3 overflow-y-auto sm:max-h-[300px]">
            {lowStock.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                <span>Nenhum produto com estoque crítico no momento.</span>
              </div>
            ) : (
              lowStock.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-black">{item.name}</p>
                    <p className="text-xs text-gray-500">Tamanho: {item.size}</p>
                  </div>
                  <span className="ml-2 flex-shrink-0 text-sm font-semibold text-red-600">{item.quantity} un.</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500 sm:mb-6">Top Produtos</h3>
        {topProducts.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Nenhuma venda no período.</p>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-black">{product.name}</p>
                  <p className="text-xs text-gray-500">Quantidade vendida</p>
                </div>
                <span className="ml-2 flex-shrink-0 text-base font-semibold text-green-600 sm:text-lg">
                  {product.quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
