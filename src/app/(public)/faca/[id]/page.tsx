import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Lora } from 'next/font/google'
import { createPublicClient } from '@/lib/supabase-server'
import type { FacaPublica } from '@/types/faca'

// Fonte serifada exclusivamente para a narrativa da peça
const lora = Lora({ subsets: ['latin'], display: 'swap' })

// Colunas explicitamente públicas — nunca selecionar campos privados
const PUBLIC_COLUMNS = [
  'id','numero_serie','nome','tipo','status',
  'aco','comprimento_lamina','comprimento_total','espessura_lamina',
  'dureza_hrc','acabamento_lamina','perfil_gume',
  'material_cabo','especie_madeira','acabamento_cabo','fixacao',
  'material_guarda','material_bainha','cor_bainha',
  'data_inicio','data_conclusao','horas_producao',
  'historia','foto_destaque','fotos','created_at',
].join(',')

// cache() garante uma única chamada ao DB por request,
// mesmo com generateMetadata e o page component chamando juntos
const getFaca = cache(async (id: string): Promise<FacaPublica | null> => {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('facas')
    .select(PUBLIC_COLUMNS)
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as unknown as FacaPublica
})

// ── Metadata dinâmica ─────────────────────────────────────────

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const faca = await getFaca(id)
  if (!faca) return { title: 'Peça não encontrada — Nosborde Cutelaria' }

  const description = faca.historia
    ? faca.historia.slice(0, 155).trimEnd() + (faca.historia.length > 155 ? '…' : '')
    : `${faca.tipo.charAt(0).toUpperCase() + faca.tipo.slice(1)} artesanal em aço ${faca.aco}, produzida por Nosborde Cutelaria.`

  return {
    title: `${faca.nome} — Nosborde Cutelaria`,
    description,
    openGraph: {
      title: `${faca.nome} — Nosborde Cutelaria`,
      description,
      ...(faca.foto_destaque && { images: [{ url: faca.foto_destaque }] }),
    },
  }
}

// ── Helpers ───────────────────────────────────────────────────

function withUnit(value: number | null, unit: string): string | null {
  if (value == null) return null
  return `${value.toLocaleString('pt-BR')} ${unit}`
}

function formatMonthYear(dateStr: string | null): string | null {
  if (!dateStr) return null
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

// ── Componentes internos (Server-only, sem 'use client') ──────

function SiteHeader() {
  return (
    <header className="px-6 pt-8 pb-6 text-center">
      <p className="text-xs font-semibold tracking-[0.35em] text-[#d4a843] uppercase">
        Nosborde
      </p>
      <p className="text-[10px] tracking-[0.25em] text-zinc-600 uppercase mt-1">
        Cutelaria Artesanal
      </p>
    </header>
  )
}

function SiteFooter({ faca }: { faca: FacaPublica }) {
  return (
    <footer className="mt-16 border-t border-[#1a1a1a] px-6 py-10 text-center space-y-4">
      <p className="text-xs text-zinc-600 leading-relaxed">
        Peça produzida artesanalmente por Nosborde Cutelaria
      </p>
      <a
        href="https://instagram.com/nosborde"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram @nosborde"
        className="inline-flex items-center gap-2 text-zinc-500 hover:text-[#d4a843] transition-colors text-sm"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
        @nosborde
      </a>
      <p className="text-[10px] text-zinc-700 font-mono tracking-wider">
        {faca.numero_serie} · {new Date().getFullYear()}
      </p>
    </footer>
  )
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-[#252525] pl-3 py-0.5">
      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-600 font-medium">{label}</p>
      <p className="text-zinc-200 text-sm font-medium mt-0.5 capitalize">{value}</p>
    </div>
  )
}

function SpecGroup({
  title,
  items,
}: {
  title: string
  items: { label: string; value: string | null }[]
}) {
  const filled = items.filter((i) => i.value)
  if (filled.length === 0) return null
  return (
    <div>
      <h3 className="text-[10px] font-semibold text-[#d4a843] uppercase tracking-[0.2em] mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
        {filled.map((item) => (
          <SpecItem key={item.label} label={item.label} value={item.value!} />
        ))}
      </div>
    </div>
  )
}

// Ícone de faca SVG para placeholder e estado "em produção"
function BladeIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 21l9-9M14.5 3.5l6 6-12 12H3v-5.5l12-12z" />
    </svg>
  )
}

// ── Página ────────────────────────────────────────────────────

export default async function FacaPublicaPage({ params }: Props) {
  const { id } = await params
  const faca = await getFaca(id)
  if (!faca) notFound()

  const galeriaFotos = (faca.fotos ?? []).slice(1) // fotos[0] já aparece no hero
  const mesAno = formatMonthYear(faca.data_conclusao)

  // ── Estado: em produção ──
  if (faca.status === 'em_producao') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="text-center max-w-xs">
            <div className="w-14 h-14 rounded-full border border-[#2a2a2a] flex items-center justify-center mx-auto mb-8">
              <BladeIcon className="text-[#d4a843]/60" />
            </div>
            <p className="text-[10px] tracking-[0.3em] text-[#d4a843] uppercase mb-4">
              Em produção
            </p>
            <h1 className="text-2xl font-semibold text-zinc-100 mb-2">{faca.nome}</h1>
            <p className="font-mono text-zinc-600 text-xs tracking-wider mb-8">
              {faca.numero_serie}
            </p>
            <p className="text-zinc-500 leading-relaxed text-sm">
              Esta peça ainda está sendo forjada. Em breve ela terá sua história completa aqui.
            </p>
          </div>
        </main>
        <SiteFooter faca={faca} />
      </div>
    )
  }

  // ── Página principal ──
  return (
    <article className="min-h-screen bg-[#0a0a0a]">
      <SiteHeader />

      {/* ── Hero ── */}
      <div className="relative w-full h-[62vw] max-h-[600px] min-h-[260px] overflow-hidden bg-[#111]">
        {faca.foto_destaque ? (
          <>
            <img
              src={faca.foto_destaque}
              alt={faca.nome}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient duplo: base escura para legibilidade do texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-7">
              <p className="font-mono text-[#d4a843] text-xs tracking-[0.2em] mb-1.5">
                {faca.numero_serie}
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white leading-tight">
                {faca.nome}
              </h1>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <BladeIcon className="text-zinc-700" />
            <p className="text-zinc-700 text-[10px] tracking-[0.25em] uppercase">
              Sem foto disponível
            </p>
          </div>
        )}
      </div>

      {/* ── Conteúdo ── */}
      <div className="max-w-2xl mx-auto px-6">

        {/* Identidade — só mostra title/serie aqui se não tiver foto (hero já exibiu) */}
        <section className="py-7 border-b border-[#181818]">
          {!faca.foto_destaque && (
            <div className="mb-4">
              <p className="font-mono text-[#d4a843] text-sm tracking-wider mb-1.5">
                {faca.numero_serie}
              </p>
              <h1 className="text-3xl font-semibold text-zinc-100">{faca.nome}</h1>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-3 py-1 border border-[#2a2a2a] text-zinc-500 rounded-full capitalize">
              {faca.tipo}
            </span>
            {faca.status === 'disponivel' && (
              <span className="text-xs px-3 py-1 bg-green-900/30 text-green-400 border border-green-900/60 rounded-full">
                Disponível
              </span>
            )}
            {faca.status === 'reservada' && (
              <span className="text-xs px-3 py-1 bg-amber-900/30 text-amber-400 border border-amber-900/60 rounded-full">
                Reservada
              </span>
            )}
            {faca.status === 'vendida' && (
              <span className="text-xs text-zinc-600 italic pl-1">
                Esta peça encontrou seu dono
              </span>
            )}
          </div>
        </section>

        {/* História */}
        {faca.historia && (
          <section className="py-10 border-b border-[#181818]">
            <h2 className="text-[10px] font-semibold text-[#d4a843] uppercase tracking-[0.25em] mb-6">
              A história desta peça
            </h2>
            <p
              className={`${lora.className} text-zinc-300 text-[1.1rem] leading-[1.85] whitespace-pre-line`}
            >
              {faca.historia}
            </p>
          </section>
        )}

        {/* Especificações técnicas */}
        <section className="py-10 border-b border-[#181818] space-y-9">
          <h2 className="text-[10px] font-semibold text-[#d4a843] uppercase tracking-[0.25em]">
            Especificações técnicas
          </h2>

          <SpecGroup
            title="Lâmina"
            items={[
              { label: 'Aço', value: faca.aco },
              { label: 'Comp. da lâmina', value: withUnit(faca.comprimento_lamina, 'cm') },
              { label: 'Comp. total', value: withUnit(faca.comprimento_total, 'cm') },
              { label: 'Espessura', value: withUnit(faca.espessura_lamina, 'mm') },
              { label: 'Dureza', value: faca.dureza_hrc != null ? `${faca.dureza_hrc} HRC` : null },
              { label: 'Acabamento', value: faca.acabamento_lamina },
              { label: 'Perfil do gume', value: faca.perfil_gume },
            ]}
          />

          <SpecGroup
            title="Cabo"
            items={[
              { label: 'Material', value: faca.material_cabo },
              { label: 'Espécie', value: faca.especie_madeira },
              { label: 'Acabamento', value: faca.acabamento_cabo },
              { label: 'Fixação', value: faca.fixacao },
            ]}
          />

          <SpecGroup
            title="Guarda & Bainha"
            items={[
              {
                label: 'Guarda',
                value: faca.material_guarda !== 'sem guarda' ? faca.material_guarda : null,
              },
              { label: 'Bainha', value: faca.material_bainha },
              { label: 'Cor da bainha', value: faca.cor_bainha },
            ]}
          />
        </section>

        {/* Produção */}
        {(mesAno || faca.horas_producao != null) && (
          <section className="py-10 border-b border-[#181818]">
            <h2 className="text-[10px] font-semibold text-[#d4a843] uppercase tracking-[0.25em] mb-6">
              Produção
            </h2>
            <div className="space-y-2.5">
              {mesAno && (
                <p className="text-zinc-400 text-sm">
                  Concluída em{' '}
                  <span className="text-zinc-200 font-medium">{mesAno}</span>
                </p>
              )}
              {faca.horas_producao != null && (
                <p className="text-zinc-400 text-sm">
                  <span className="text-zinc-200 font-medium">
                    {faca.horas_producao.toLocaleString('pt-BR')} horas
                  </span>{' '}
                  de trabalho artesanal
                </p>
              )}
              <p className="text-zinc-600 text-xs font-mono mt-4 pt-4 border-t border-[#181818]">
                Aço {faca.aco}
              </p>
            </div>
          </section>
        )}

        {/* Galeria */}
        {galeriaFotos.length > 0 && (
          <section className="py-10 border-b border-[#181818]">
            <h2 className="text-[10px] font-semibold text-[#d4a843] uppercase tracking-[0.25em] mb-6">
              Galeria
            </h2>

            {/* Mobile: scroll horizontal com snap */}
            <div className="sm:hidden flex gap-3 overflow-x-auto pb-3 -mx-6 px-6 snap-x snap-mandatory scrollbar-none">
              {galeriaFotos.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 snap-start"
                >
                  <img
                    src={url}
                    alt={`${faca.nome} — detalhe ${i + 2}`}
                    className="h-60 w-48 object-cover rounded-lg"
                  />
                </a>
              ))}
            </div>

            {/* Desktop: grid */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
              {galeriaFotos.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-lg"
                >
                  <img
                    src={url}
                    alt={`${faca.nome} — detalhe ${i + 2}`}
                    className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-500"
                  />
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      <SiteFooter faca={faca} />
    </article>
  )
}
