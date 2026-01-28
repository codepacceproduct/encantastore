import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-neutral-50">
      <h2 className="text-2xl font-bold text-neutral-900">Página não encontrada</h2>
      <p className="text-neutral-500">A página que você está procurando não existe ou foi movida.</p>
      <Button asChild>
        <Link href="/dashboard">Voltar para o Dashboard</Link>
      </Button>
    </div>
  )
}
