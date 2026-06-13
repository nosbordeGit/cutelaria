export type FacaTipo = 'faca' | 'facão' | 'adaga' | 'canivete' | 'utilitária'
export type FacaStatus = 'em_producao' | 'disponivel' | 'reservada' | 'vendida'

export interface Faca {
  id: string
  numero_serie: string
  nome: string
  tipo: FacaTipo
  status: FacaStatus

  // Lâmina
  aco: string
  comprimento_lamina: number | null
  comprimento_total: number | null
  espessura_lamina: number | null
  dureza_hrc: number | null
  acabamento_lamina: string | null
  perfil_gume: string | null

  // Cabo
  material_cabo: string | null
  especie_madeira: string | null
  acabamento_cabo: string | null
  fixacao: string | null

  // Guarda
  material_guarda: string | null

  // Bainha
  material_bainha: string | null
  cor_bainha: string | null

  // Produção
  data_inicio: string | null
  data_conclusao: string | null
  horas_producao: number | null
  historia: string | null
  observacoes: string | null

  // Comercial (privado — nunca expor na página pública)
  preco_custo: number | null
  preco_venda: number | null
  data_venda: string | null
  canal_venda: string | null

  // Comprador (privado — nunca expor na página pública)
  comprador_nome: string | null
  comprador_cidade: string | null
  comprador_estado: string | null
  comprador_origem: string | null

  // Mídia
  foto_destaque: string | null
  fotos: string[] | null

  // Controle
  created_at: string
  updated_at: string
}

export type FacaPublica = Pick<
  Faca,
  | 'id'
  | 'numero_serie'
  | 'nome'
  | 'tipo'
  | 'status'
  | 'aco'
  | 'comprimento_lamina'
  | 'comprimento_total'
  | 'espessura_lamina'
  | 'dureza_hrc'
  | 'acabamento_lamina'
  | 'perfil_gume'
  | 'material_cabo'
  | 'especie_madeira'
  | 'acabamento_cabo'
  | 'fixacao'
  | 'material_guarda'
  | 'material_bainha'
  | 'cor_bainha'
  | 'data_inicio'
  | 'data_conclusao'
  | 'horas_producao'
  | 'historia'
  | 'foto_destaque'
  | 'fotos'
  | 'created_at'
  | 'updated_at'
>

export type FacaFormData = Omit<Faca, 'id' | 'numero_serie' | 'created_at' | 'updated_at'>
