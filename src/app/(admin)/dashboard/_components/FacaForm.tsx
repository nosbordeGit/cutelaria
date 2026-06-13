'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCode, downloadQRCode } from 'react-qrcode-logo'
import type { Faca, FacaTipo, FacaStatus } from '@/types/faca'

// ── Constantes ────────────────────────────────────────────────

const ESTADOS_BR = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const APP_URL = 'https://cutelaria.vercel.app'

// ── Helpers de conversão ──────────────────────────────────────

function toNum(v: string): number | null {
  const n = parseFloat(v.replace(',', '.'))
  return isNaN(n) ? null : n
}
function toInt(v: string): number | null {
  const n = parseInt(v, 10)
  return isNaN(n) ? null : n
}
function toStr(v: string): string | null {
  return v.trim() || null
}

// ── Estado do formulário (todos campos como string) ───────────

interface FormState {
  nome: string; tipo: string; status: string; aco: string
  comprimento_lamina: string; comprimento_total: string; espessura_lamina: string; dureza_hrc: string
  acabamento_lamina: string; perfil_gume: string
  material_cabo: string; especie_madeira: string; acabamento_cabo: string; fixacao: string
  material_guarda: string; material_bainha: string; cor_bainha: string
  data_inicio: string; data_conclusao: string; horas_producao: string
  historia: string; observacoes: string
  preco_custo: string; preco_venda: string; canal_venda: string
  data_venda: string; comprador_nome: string; comprador_cidade: string
  comprador_estado: string; comprador_origem: string
}

function initForm(faca?: Faca): FormState {
  if (!faca) return {
    nome: '', tipo: '', status: 'em_producao', aco: '',
    comprimento_lamina: '', comprimento_total: '', espessura_lamina: '', dureza_hrc: '',
    acabamento_lamina: '', perfil_gume: '',
    material_cabo: '', especie_madeira: '', acabamento_cabo: '', fixacao: '',
    material_guarda: '', material_bainha: '', cor_bainha: '',
    data_inicio: '', data_conclusao: '', horas_producao: '',
    historia: '', observacoes: '',
    preco_custo: '', preco_venda: '', canal_venda: '',
    data_venda: '', comprador_nome: '', comprador_cidade: '',
    comprador_estado: '', comprador_origem: '',
  }
  return {
    nome: faca.nome, tipo: faca.tipo, status: faca.status, aco: faca.aco,
    comprimento_lamina: faca.comprimento_lamina?.toString() ?? '',
    comprimento_total:  faca.comprimento_total?.toString() ?? '',
    espessura_lamina:   faca.espessura_lamina?.toString() ?? '',
    dureza_hrc:         faca.dureza_hrc?.toString() ?? '',
    acabamento_lamina:  faca.acabamento_lamina ?? '',
    perfil_gume:        faca.perfil_gume ?? '',
    material_cabo:      faca.material_cabo ?? '',
    especie_madeira:    faca.especie_madeira ?? '',
    acabamento_cabo:    faca.acabamento_cabo ?? '',
    fixacao:            faca.fixacao ?? '',
    material_guarda:    faca.material_guarda ?? '',
    material_bainha:    faca.material_bainha ?? '',
    cor_bainha:         faca.cor_bainha ?? '',
    data_inicio:        faca.data_inicio ?? '',
    data_conclusao:     faca.data_conclusao ?? '',
    horas_producao:     faca.horas_producao?.toString() ?? '',
    historia:           faca.historia ?? '',
    observacoes:        faca.observacoes ?? '',
    preco_custo:        faca.preco_custo?.toString() ?? '',
    preco_venda:        faca.preco_venda?.toString() ?? '',
    canal_venda:        faca.canal_venda ?? '',
    data_venda:         faca.data_venda ?? '',
    comprador_nome:     faca.comprador_nome ?? '',
    comprador_cidade:   faca.comprador_cidade ?? '',
    comprador_estado:   faca.comprador_estado ?? '',
    comprador_origem:   faca.comprador_origem ?? '',
  }
}

// ── Estilos reutilizáveis ─────────────────────────────────────

const inputCls = 'w-full bg-[#0a0a0a] border border-[#333] rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#d4a843] focus:ring-1 focus:ring-[#d4a843]/10 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5'
const sectionCls = 'bg-[#111] border border-[#222] rounded-lg p-6 space-y-5'
const sectionTitleCls = 'text-xs font-semibold text-[#d4a843] uppercase tracking-widest pb-2 border-b border-[#222]'

// ── Componente ────────────────────────────────────────────────

interface Props { faca?: Faca }

export default function FacaForm({ faca }: Props) {
  const router = useRouter()
  const isEdit = Boolean(faca)

  const [form, setForm] = useState<FormState>(() => initForm(faca))
  const [pendingFiles, setPendingFiles] = useState<{ file: File; preview: string }[]>([])
  const [existingUrls, setExistingUrls] = useState<string[]>(faca?.fotos ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // ── Fotos ──

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const items = files
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setPendingFiles((prev) => [...prev, ...items])
    e.target.value = ''
  }

  function removePending(i: number) {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[i].preview)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  function removeExisting(i: number) {
    setExistingUrls((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function uploadPendingFiles(folder: string): Promise<string[]> {
    const urls: string[] = []
    for (const { file } of pendingFiles) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? 'Erro ao fazer upload')
      }
      const { url } = await res.json()
      urls.push(url)
    }
    return urls
  }

  // ── Submit ──

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return }
    if (!form.tipo)        { setError('Tipo é obrigatório.'); return }
    if (!form.aco.trim())  { setError('Aço é obrigatório.'); return }

    setSubmitting(true)
    try {
      const folder = faca ? faca.numero_serie : `tmp/${crypto.randomUUID()}`
      const newUrls = pendingFiles.length > 0 ? await uploadPendingFiles(folder) : []
      const allUrls = [...existingUrls, ...newUrls]

      const payload = {
        nome:              form.nome,
        tipo:              form.tipo as FacaTipo,
        status:            form.status as FacaStatus,
        aco:               form.aco,
        comprimento_lamina: toNum(form.comprimento_lamina),
        comprimento_total:  toNum(form.comprimento_total),
        espessura_lamina:   toNum(form.espessura_lamina),
        dureza_hrc:         toInt(form.dureza_hrc),
        acabamento_lamina:  toStr(form.acabamento_lamina),
        perfil_gume:        toStr(form.perfil_gume),
        material_cabo:      toStr(form.material_cabo),
        especie_madeira:    toStr(form.especie_madeira),
        acabamento_cabo:    toStr(form.acabamento_cabo),
        fixacao:            toStr(form.fixacao),
        material_guarda:    toStr(form.material_guarda),
        material_bainha:    toStr(form.material_bainha),
        cor_bainha:         toStr(form.cor_bainha),
        data_inicio:        toStr(form.data_inicio),
        data_conclusao:     toStr(form.data_conclusao),
        horas_producao:     toNum(form.horas_producao),
        historia:           toStr(form.historia),
        observacoes:        toStr(form.observacoes),
        preco_custo:        toNum(form.preco_custo),
        preco_venda:        toNum(form.preco_venda),
        canal_venda:        toStr(form.canal_venda),
        data_venda:         form.status === 'vendida' ? toStr(form.data_venda) : null,
        comprador_nome:     form.status === 'vendida' ? toStr(form.comprador_nome) : null,
        comprador_cidade:   form.status === 'vendida' ? toStr(form.comprador_cidade) : null,
        comprador_estado:   form.status === 'vendida' ? toStr(form.comprador_estado) : null,
        comprador_origem:   form.status === 'vendida' ? toStr(form.comprador_origem) : null,
        foto_destaque:      allUrls[0] ?? null,
        fotos:              allUrls.length > 0 ? allUrls : null,
      }

      const url    = isEdit ? `/api/facas/${faca!.id}` : '/api/facas'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? 'Erro ao salvar')
      }

      router.push(`/dashboard?success=${isEdit ? 'updated' : 'created'}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Excluir ──

  async function handleDelete() {
    if (!faca) return
    if (!confirm(`Excluir ${faca.numero_serie} — ${faca.nome}?\n\nEsta ação não pode ser desfeita.`)) return
    setSubmitting(true)
    const res = await fetch(`/api/facas/${faca.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/dashboard')
    } else {
      const { error: msg } = await res.json()
      setError(msg ?? 'Erro ao excluir')
      setSubmitting(false)
    }
  }

  const qrValue = faca ? `${APP_URL}/faca/${faca.id}` : ''

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Page header */}
      <header className="border-b border-[#1a1a1a] px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
        >
          ← Voltar
        </button>
        <div>
          <h1 className="text-base font-semibold text-zinc-100">
            {isEdit ? `Editar — ${faca!.numero_serie}` : 'Nova faca'}
          </h1>
          {isEdit && <p className="text-xs text-zinc-500">{faca!.nome}</p>}
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* ── Seção 1: Identidade ── */}
        <div className={sectionCls}>
          <h2 className={sectionTitleCls}>Identidade</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nome *</label>
              <input type="text" required value={form.nome} onChange={(e) => set('nome', e.target.value)}
                className={inputCls} placeholder="Ex: Caçador das Gerais" />
            </div>
            <div>
              <label className={labelCls}>Tipo *</label>
              <select required value={form.tipo} onChange={(e) => set('tipo', e.target.value)} className={inputCls}>
                <option value="">Selecionar…</option>
                {(['faca','facão','adaga','canivete','utilitária'] as FacaTipo[]).map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
                <option value="em_producao">Em produção</option>
                <option value="disponivel">Disponível</option>
                <option value="reservada">Reservada</option>
                <option value="vendida">Vendida</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Seção 2: Lâmina ── */}
        <div className={sectionCls}>
          <h2 className={sectionTitleCls}>Lâmina</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Aço *</label>
              <input type="text" required list="aco-list" value={form.aco} onChange={(e) => set('aco', e.target.value)}
                className={inputCls} placeholder="Ex: D2, 1095, 440C" />
              <datalist id="aco-list">
                {['D2','1070','1095','440C','ATS-34','N690','VG10'].map((a) => <option key={a} value={a} />)}
              </datalist>
            </div>
            <div>
              <label className={labelCls}>Dureza (HRC)</label>
              <input type="number" min={0} max={70} value={form.dureza_hrc} onChange={(e) => set('dureza_hrc', e.target.value)}
                className={inputCls} placeholder="Ex: 60" />
            </div>
            <div>
              <label className={labelCls}>Comp. lâmina (cm)</label>
              <input type="number" step="0.1" min={0} value={form.comprimento_lamina} onChange={(e) => set('comprimento_lamina', e.target.value)}
                className={inputCls} placeholder="Ex: 15.5" />
            </div>
            <div>
              <label className={labelCls}>Comp. total (cm)</label>
              <input type="number" step="0.1" min={0} value={form.comprimento_total} onChange={(e) => set('comprimento_total', e.target.value)}
                className={inputCls} placeholder="Ex: 28.0" />
            </div>
            <div>
              <label className={labelCls}>Espessura lâmina (mm)</label>
              <input type="number" step="0.01" min={0} value={form.espessura_lamina} onChange={(e) => set('espessura_lamina', e.target.value)}
                className={inputCls} placeholder="Ex: 3.5" />
            </div>
            <div>
              <label className={labelCls}>Perfil do gume</label>
              <select value={form.perfil_gume} onChange={(e) => set('perfil_gume', e.target.value)} className={inputCls}>
                <option value="">—</option>
                <option value="côncavo">Côncavo</option>
                <option value="convexo">Convexo</option>
                <option value="plano">Plano</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Acabamento da lâmina</label>
              <select value={form.acabamento_lamina} onChange={(e) => set('acabamento_lamina', e.target.value)} className={inputCls}>
                <option value="">—</option>
                <option value="fosco">Fosco</option>
                <option value="acetinado">Acetinado</option>
                <option value="espelhado">Espelhado</option>
                <option value="stonewash">Stonewash</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Seção 3: Cabo ── */}
        <div className={sectionCls}>
          <h2 className={sectionTitleCls}>Cabo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Material do cabo</label>
              <select value={form.material_cabo} onChange={(e) => set('material_cabo', e.target.value)} className={inputCls}>
                <option value="">—</option>
                {['madeira','micarta','G10','osso','resina'].map((m) => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>
            {form.material_cabo === 'madeira' && (
              <div>
                <label className={labelCls}>Espécie da madeira</label>
                <input type="text" value={form.especie_madeira} onChange={(e) => set('especie_madeira', e.target.value)}
                  className={inputCls} placeholder="Ex: Ipê, Jacarandá" />
              </div>
            )}
            <div>
              <label className={labelCls}>Acabamento do cabo</label>
              <input type="text" value={form.acabamento_cabo} onChange={(e) => set('acabamento_cabo', e.target.value)}
                className={inputCls} placeholder="Ex: óleo, verniz, cera" />
            </div>
            <div>
              <label className={labelCls}>Fixação</label>
              <select value={form.fixacao} onChange={(e) => set('fixacao', e.target.value)} className={inputCls}>
                <option value="">—</option>
                <option value="rebites">Rebites</option>
                <option value="espigão">Espigão</option>
                <option value="cola">Cola</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Seção 4: Guarda e Bainha ── */}
        <div className={sectionCls}>
          <h2 className={sectionTitleCls}>Guarda &amp; Bainha</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Material da guarda</label>
              <select value={form.material_guarda} onChange={(e) => set('material_guarda', e.target.value)} className={inputCls}>
                <option value="">—</option>
                <option value="latão">Latão</option>
                <option value="aço">Aço</option>
                <option value="alpaca">Alpaca</option>
                <option value="sem guarda">Sem guarda</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Material da bainha</label>
              <select value={form.material_bainha} onChange={(e) => set('material_bainha', e.target.value)} className={inputCls}>
                <option value="">—</option>
                <option value="couro">Couro</option>
                <option value="kydex">Kydex</option>
                <option value="não inclusa">Não inclusa</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Cor da bainha</label>
              <input type="text" value={form.cor_bainha} onChange={(e) => set('cor_bainha', e.target.value)}
                className={inputCls} placeholder="Ex: marrom natural" />
            </div>
          </div>
        </div>

        {/* ── Seção 5: Produção ── */}
        <div className={sectionCls}>
          <h2 className={sectionTitleCls}>Produção</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Início</label>
              <input type="date" value={form.data_inicio} onChange={(e) => set('data_inicio', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Conclusão</label>
              <input type="date" value={form.data_conclusao} onChange={(e) => set('data_conclusao', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Horas de produção</label>
              <input type="number" step="0.5" min={0} value={form.horas_producao} onChange={(e) => set('horas_producao', e.target.value)}
                className={inputCls} placeholder="Ex: 12.5" />
            </div>
          </div>
          <div>
            <label className={labelCls}>História da peça <span className="text-zinc-600 normal-case">(aparece na página pública)</span></label>
            <textarea rows={5} value={form.historia} onChange={(e) => set('historia', e.target.value)}
              className={inputCls + ' resize-y'} placeholder="Conte a origem, inspiração e particularidades desta faca…" />
          </div>
          <div>
            <label className={labelCls}>Observações internas <span className="text-zinc-600 normal-case">(não aparecem ao público)</span></label>
            <textarea rows={3} value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)}
              className={inputCls + ' resize-y'} placeholder="Notas para uso próprio…" />
          </div>
        </div>

        {/* ── Seção 6: Comercial ── */}
        <div className={sectionCls}>
          <h2 className={sectionTitleCls}>Comercial</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Custo (R$)</label>
              <input type="number" step="0.01" min={0} value={form.preco_custo} onChange={(e) => set('preco_custo', e.target.value)}
                className={inputCls} placeholder="0,00" />
            </div>
            <div>
              <label className={labelCls}>Venda (R$)</label>
              <input type="number" step="0.01" min={0} value={form.preco_venda} onChange={(e) => set('preco_venda', e.target.value)}
                className={inputCls} placeholder="0,00" />
            </div>
            <div>
              <label className={labelCls}>Canal de venda</label>
              <select value={form.canal_venda} onChange={(e) => set('canal_venda', e.target.value)} className={inputCls}>
                <option value="">—</option>
                <option value="instagram">Instagram</option>
                <option value="indicação">Indicação</option>
                <option value="feira">Feira</option>
                <option value="site">Site</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Seção 7: Comprador (só se vendida) ── */}
        {form.status === 'vendida' && (
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}>Comprador</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Data da venda</label>
                <input type="date" value={form.data_venda} onChange={(e) => set('data_venda', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Nome</label>
                <input type="text" value={form.comprador_nome} onChange={(e) => set('comprador_nome', e.target.value)}
                  className={inputCls} placeholder="Nome completo" />
              </div>
              <div>
                <label className={labelCls}>Cidade</label>
                <input type="text" value={form.comprador_cidade} onChange={(e) => set('comprador_cidade', e.target.value)}
                  className={inputCls} placeholder="Ex: Belo Horizonte" />
              </div>
              <div>
                <label className={labelCls}>Estado</label>
                <select value={form.comprador_estado} onChange={(e) => set('comprador_estado', e.target.value)} className={inputCls}>
                  <option value="">—</option>
                  {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Como conheceu</label>
                <select value={form.comprador_origem} onChange={(e) => set('comprador_origem', e.target.value)} className={inputCls}>
                  <option value="">—</option>
                  <option value="instagram">Instagram</option>
                  <option value="indicação">Indicação</option>
                  <option value="feira">Feira</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Seção 8: Fotos ── */}
        <div className={sectionCls}>
          <h2 className={sectionTitleCls}>Fotos</h2>

          {/* Previews */}
          {(existingUrls.length > 0 || pendingFiles.length > 0) && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {existingUrls.map((url, i) => (
                <div key={url} className="relative aspect-square group">
                  <img src={url} alt="" className="w-full h-full object-cover rounded" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 text-xs bg-[#d4a843] text-black px-1.5 py-0.5 rounded font-semibold">
                      ★
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExisting(i)}
                    className="absolute top-1 right-1 bg-black/70 text-white text-xs w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
              {pendingFiles.map(({ preview }, i) => (
                <div key={i} className="relative aspect-square group">
                  <img src={preview} alt="" className="w-full h-full object-cover rounded opacity-70" />
                  <span className="absolute bottom-1 left-1 text-xs bg-zinc-800 text-zinc-300 px-1 rounded">novo</span>
                  <button
                    type="button"
                    onClick={() => removePending(i)}
                    className="absolute top-1 right-1 bg-black/70 text-white text-xs w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer border border-dashed border-[#333] rounded-lg p-4 hover:border-[#d4a843]/50 transition-colors">
            <span className="text-[#d4a843]">+</span>
            <span className="text-sm text-zinc-400">Adicionar fotos</span>
            <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="sr-only" />
          </label>
          <p className="text-xs text-zinc-600">A primeira foto vira a imagem de destaque.</p>
        </div>

        {/* ── Erro ── */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* ── Ações ── */}
        <div className="flex flex-wrap items-center gap-3 pb-10">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#d4a843] text-black font-semibold text-sm rounded hover:bg-[#c49a3a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Cadastrar faca'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            disabled={submitting}
            className="px-6 py-2.5 border border-[#333] text-zinc-300 text-sm rounded hover:border-[#444] transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="ml-auto px-6 py-2.5 border border-red-900 text-red-400 text-sm rounded hover:bg-red-900/20 transition-colors disabled:opacity-40"
            >
              Excluir faca
            </button>
          )}
        </div>

        {/* ── QR Code (só no edit) ── */}
        {isEdit && faca && (
          <div className={sectionCls + ' mb-10'}>
            <h2 className={sectionTitleCls}>QR Code</h2>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="bg-white p-3 rounded-lg">
                <QRCode
                  value={qrValue}
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#0a0a0a"
                  qrStyle="squares"
                  ecLevel="M"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">URL pública</p>
                  <code className="text-sm text-[#d4a843] break-all">{qrValue}</code>
                </div>
                <p className="text-xs text-zinc-600">Cole na caixa da faca. Ao escanear, o cliente vê a página da peça.</p>
                <button
                  type="button"
                  onClick={() => downloadQRCode(
                    { value: qrValue, size: 512, bgColor: '#ffffff', fgColor: '#0a0a0a', ecLevel: 'M' },
                    'png',
                    `QR-${faca.numero_serie}`
                  )}
                  className="px-4 py-2 border border-[#333] text-zinc-300 text-sm rounded hover:border-[#d4a843] hover:text-[#d4a843] transition-colors"
                >
                  ↓ Baixar PNG (512px)
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
