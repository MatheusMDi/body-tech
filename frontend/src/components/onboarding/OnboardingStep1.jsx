export default function OnboardingStep1({ onNext }) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center gap-8">
      {/* Logo mark */}
      <div className="relative">
        <div className="w-20 h-20 border-2 border-primary flex items-center justify-center">
          <span className="text-primary font-bold text-[28px] tracking-tight">BT</span>
        </div>
        <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-primary" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary" />
      </div>

      <div className="space-y-3">
        <h1 className="text-[28px] font-bold" style={{ color: 'var(--theme-text)' }}>
          Bem-vindo ao Body Tech
        </h1>
        <p className="text-[16px] leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
          Vamos configurar seu protocolo em 2 minutos. Precisamos de alguns dados para personalizar sua experiência.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full btn-primary mt-4"
      >
        Começar
      </button>
    </div>
  )
}
