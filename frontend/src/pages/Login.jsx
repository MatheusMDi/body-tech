import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'

export default function Login() {
  const { signInWithMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await signInWithMagicLink(email)
    if (err) {
      setError(err.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-dark flex flex-col items-center justify-center px-6">
      {/* Hero header */}
      <div className="w-full max-w-md mb-10 relative">
        <div className="absolute top-0 left-0 w-3 h-3 bg-primary" />
        <div className="pt-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Body Tech</div>
          <h1 className="text-[36px] font-bold leading-[1.25] text-on-dark mb-2">
            Protocolo 18:6
          </h1>
          <p className="text-[15px] text-on-dark-mute leading-relaxed">
            Sistema 24/7 de monitoramento de saúde e performance pessoal.
          </p>
        </div>
      </div>

      {/* Login card */}
      <div className="w-full max-w-md card-dark border border-hairline-strong rounded-sm p-6 relative overflow-hidden">
        <div className="corner-square bottom-0 right-0" />

        {sent ? (
          <div className="text-center py-4">
            <div className="text-[32px] mb-4">📬</div>
            <div className="text-[18px] font-bold text-on-dark mb-2">Magic link enviado!</div>
            <p className="text-[14px] text-on-dark-mute">
              Verifique seu email <strong className="text-primary">{email}</strong> e clique no link para entrar.
            </p>
          </div>
        ) : (
          <>
            <div className="text-[11px] font-bold uppercase tracking-widest text-mute mb-5">Acesso via Magic Link</div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-mute mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="input-field bg-surface-elevated text-on-dark border-hairline-strong placeholder-stone"
                />
              </div>

              {error && (
                <div className="text-error text-[13px] font-bold">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Enviando...' : 'Entrar com Magic Link'}
              </button>
            </form>
          </>
        )}
      </div>

      <div className="mt-6 text-[10px] text-stone uppercase tracking-widest text-center">
        Single-user · Protocolo pessoal
      </div>
    </div>
  )
}
