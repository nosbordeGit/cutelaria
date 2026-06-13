export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm">
        {/* Ícone de faca */}
        <div className="mb-10">
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto text-zinc-800"
            aria-hidden="true"
          >
            <path d="M3 21l9-9M14.5 3.5l6 6-12 12H3v-5.5l12-12z" />
          </svg>
        </div>

        <p className="text-[10px] tracking-[0.35em] text-[#d4a843] uppercase mb-5">
          Nosborde Cutelaria
        </p>

        <h1 className="text-2xl font-semibold text-zinc-100 mb-4 leading-snug">
          Esta peça não foi encontrada
        </h1>

        <p className="text-zinc-500 text-sm leading-relaxed mb-10">
          O QR Code pode estar danificado ou a peça foi removida do sistema.
        </p>

        <a
          href="https://instagram.com/nosborde"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram @nosborde"
          className="inline-flex items-center gap-2.5 text-zinc-500 hover:text-[#d4a843] transition-colors text-sm"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          Entre em contato: @nosborde
        </a>
      </div>
    </div>
  )
}
