export function AiDisclaimer() {
  return (
    <div className="flex items-start gap-2 px-4 py-2 border-t border-yellow/20 bg-yellow/5">
      <span className="text-yellow text-xs flex-shrink-0 mt-px">⚠</span>
      <p className="text-yellow/70 font-rajdhani text-[11px] leading-relaxed">
        AI-generated information only — not regulated financial or tax advice under the Financial Services and Markets Act 2000.
        Always consult a qualified professional before making financial decisions.
      </p>
    </div>
  )
}
