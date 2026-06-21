'use client'

import { useCallback, useState } from 'react'
import { Upload, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface UploadResult {
  imported: number
  flagged: number
  errors: string[]
}

export function CsvUpload({ onSuccess }: { onSuccess: () => void }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }
    setUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload/transactions', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      toast.success(`${data.imported} transactions imported`)
      onSuccess()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }, [onSuccess])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer',
          dragging ? 'border-cyan bg-cyanGlow' : 'border-border hover:border-cyan/50'
        )}
        onClick={() => document.getElementById('csv-input')?.click()}
      >
        <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
            <p className="font-orbitron text-xs text-cyan">FINN IS ANALYSING YOUR TRANSACTIONS...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload size={32} className="text-cyan opacity-60" />
            <p className="font-orbitron text-xs text-cyan uppercase tracking-widest">DROP CSV FILE OR CLICK TO UPLOAD</p>
            <p className="text-textMuted text-xs font-rajdhani">Bank export, PayPal, Stripe, FreeAgent CSV formats</p>
          </div>
        )}
      </div>

      {result && (
        <div className="bg-surface border border-green/30 p-4 flex items-center gap-3">
          <CheckCircle size={18} className="text-green flex-shrink-0" />
          <div>
            <p className="text-green font-orbitron text-xs">IMPORT COMPLETE</p>
            <p className="text-textMuted text-sm font-rajdhani">
              {result.imported} transactions imported
              {result.flagged > 0 && `, ${result.flagged} flagged for review`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
