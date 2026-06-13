'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { Faca, FacaStatus, FacaTipo } from '@/types/faca'

const STATUS_CONFIG: Record<FacaStatus, { label: string; cls: string }> = {
  em_producao: { label: 'Em produção', cls: 'bg-zinc-800 text-zinc-300' },
  disponivel:  { label: 'Disponível',  cls: 'bg-green-900/50 text-green-400' },
  reservada:   { label: 'Reservada',   cls: 'bg-amber-900/50 text-amber-400' },
  vendida:     { label: 'Vendida',     cls: 'bg-blue-900/50 text-blue-400' },
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

interface Props {
  initialFacas: Faca[]
}

export default function DashboardClient({ initialFacas }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [facas] = useState<Faca[]>(initialFacas)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterTipo, setFilterTipo] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const msg = searchParams.get('success')
    if (!msg) return
    setToast(msg === 'created' ? 'Faca cadastrada com sucesso!' : 'Faca atualizada com sucesso!')
    router.replace('/dashboard')
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [searchParams, router])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return facas.filter((f) => {
      if (filterStatus !== 'all' && f.status !== filterStatus) return false
      if (filterTipo !== 'all' && f.tipo !== filterTipo) return false
      if (q && !f.numero_serie.toLowerCase().includes(q) && !f.nome.toLowerCase().includes(q)) return false
      return true
    })
  }, [facas, filterStatus, filterTipo, search])

  const stats = useMemo(() => ({
    total:       facas.length,
    disponivel:  facas.filter((f) => f.status === 'disponivel').length,
    vendida:     facas.filter((f) => f.status === 'vendida').length,
    em_producao: facas.filter((f) => f.status === 'em_producao').length,
  }), [facas])

  const tipos = useMemo(() => {
    const set = new Set(facas.map((f) => f.tipo))
    return Array.from(set).sort()
  }, [facas])

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/login')
  }

  const inputCls = 'bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-[#d4a843] transition-colors'
  const selectCls = inputCls + ' cursor-pointer'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-900/80 border border-green-700 text-green-300 text-sm px-5 py-3 rounded shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-widest uppercase text-zinc-100">Nosborde</h1>
          <p className="text-xs text-zinc-500 tracking-wider">Cutelaria Artesanal</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/nova"
            className="px-4 py-2 bg-[#d4a843] text-black text-sm font-semibold rounded hover:bg-[#c49a3a] transition-colors"
          >
            + Nova faca
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-2 border border-[#333] text-zinc-400 text-sm rounded hover:border-[#444] hover:text-zinc-200 transition-colors disabled:opacity-40"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-zinc-100' },
            { label: 'Disponíveis', value: stats.disponivel, color: 'text-green-400' },
            { label: 'Vendidas', value: stats.vendida, color: 'text-blue-400' },
            { label: 'Em produção', value: stats.em_producao, color: 'text-zinc-400' },
          ].map((s) => (
            <div key={s.label} className="bg-[#111] border border-[#222] rounded-lg p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por número ou nome…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputCls + ' flex-1 min-w-[200px]'}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectCls}>
            <option value="all">Todos os status</option>
            <option value="em_producao">Em produção</option>
            <option value="disponivel">Disponível</option>
            <option value="reservada">Reservada</option>
            <option value="vendida">Vendida</option>
          </select>
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className={selectCls}>
            <option value="all">Todos os tipos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-600">
            <p className="text-lg">Nenhuma faca encontrada.</p>
            {facas.length === 0 && (
              <Link href="/dashboard/nova" className="mt-4 inline-block text-[#d4a843] text-sm hover:underline">
                Cadastrar a primeira faca →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((faca) => {
              const sc = STATUS_CONFIG[faca.status]
              return (
                <div key={faca.id} className="bg-[#111] border border-[#222] rounded-lg overflow-hidden hover:border-[#333] transition-colors">
                  {/* Foto */}
                  <div className="aspect-[4/3] bg-[#0d0d0d] relative">
                    {faca.foto_destaque ? (
                      <img
                        src={faca.foto_destaque}
                        alt={faca.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs tracking-widest uppercase">
                        Sem foto
                      </div>
                    )}
                    <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded font-medium ${sc.cls}`}>
                      {sc.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[#d4a843] font-mono text-sm font-semibold tracking-wider">{faca.numero_serie}</p>
                      <h3 className="text-zinc-100 font-medium mt-0.5">{faca.nome}</h3>
                      <p className="text-zinc-500 text-xs capitalize mt-0.5">{faca.tipo}</p>
                    </div>

                    <div className="text-xs text-zinc-500 space-y-1">
                      <p>Aço: <span className="text-zinc-300">{faca.aco}</span></p>
                      {faca.material_cabo && (
                        <p>
                          Cabo: <span className="text-zinc-300">
                            {faca.especie_madeira ? `${faca.especie_madeira} (${faca.material_cabo})` : faca.material_cabo}
                          </span>
                        </p>
                      )}
                      {faca.data_conclusao && (
                        <p>Concluída: <span className="text-zinc-300">{formatDate(faca.data_conclusao)}</span></p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Link
                        href={`/dashboard/${faca.id}`}
                        className="flex-1 text-center py-1.5 border border-[#333] text-zinc-300 text-xs rounded hover:border-[#d4a843] hover:text-[#d4a843] transition-colors"
                      >
                        Editar
                      </Link>
                      <a
                        href={`/faca/${faca.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center py-1.5 border border-[#333] text-zinc-300 text-xs rounded hover:border-[#444] hover:text-zinc-100 transition-colors"
                      >
                        Ver QR
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
