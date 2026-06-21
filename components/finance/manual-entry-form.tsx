'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, ChevronDown } from 'lucide-react'
import { CyberInput } from '@/components/ui/cyber-input'
import { CyberButton } from '@/components/ui/cyber-button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const schema = z.object({
  date: z.string().min(1, 'Date required'),
  description: z.string().min(2, 'Description required'),
  amount: z.string().min(1, 'Amount required'),
  currency: z.string().min(1),
  type: z.enum(['income', 'expense']),
})

type FormData = z.infer<typeof schema>

export function ManualEntryForm({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'income', currency: 'GBP' },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Not authenticated'); setLoading(false); return }

    const amount = parseFloat(data.amount)
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      date: data.date,
      description: data.description,
      amount,
      currency: data.currency,
      amount_gbp: amount,
      type: data.type,
      category: data.type === 'income' ? 'Revenue' : 'Other',
      is_flagged: false,
    })

    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Transaction added')
    reset()
    onSuccess()
    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-cyan font-orbitron text-xs uppercase tracking-widest border border-cyan/30 px-4 py-2 hover:bg-cyanGlow transition-colors"
      >
        <Plus size={14} />
        Add Transaction
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-4 bg-surface border border-border p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <CyberInput label="Date" type="date" error={errors.date?.message} {...register('date')} />
            <CyberInput label="Description" placeholder="What was this?" error={errors.description?.message} {...register('description')} />
            <CyberInput label="Amount" type="number" step="0.01" placeholder="0.00" error={errors.amount?.message} {...register('amount')} />
            <div className="flex flex-col gap-1">
              <label className="text-cyan text-xs font-orbitron uppercase tracking-widest">Currency</label>
              <select className="px-4 py-3 bg-surface border border-border text-text font-rajdhani outline-none focus:border-cyan appearance-none" {...register('currency')}>
                <option value="GBP">GBP £</option>
                <option value="USD">USD $</option>
                <option value="CAD">CAD CA$</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-cyan text-xs font-orbitron uppercase tracking-widest">Type</label>
              <select className="px-4 py-3 bg-surface border border-border text-text font-rajdhani outline-none focus:border-cyan appearance-none" {...register('type')}>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div className="flex items-end">
              <CyberButton type="submit" loading={loading} fullWidth>Save</CyberButton>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
