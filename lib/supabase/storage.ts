import { createClient } from './client'

export async function uploadDocument(file: File, userId: string): Promise<string | null> {
  const supabase = createClient()
  const path = `${userId}/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('documents').upload(path, file)
  if (error) return null
  return supabase.storage.from('documents').getPublicUrl(path).data.publicUrl
}

export async function listDocuments(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from('documents').list(userId, { sortBy: { column: 'created_at', order: 'desc' } })
  if (error || !data) return []
  return data.map(f => ({
    name: f.name,
    created_at: f.created_at || '',
    size: f.metadata?.size || 0,
    url: supabase.storage.from('documents').getPublicUrl(`${userId}/${f.name}`).data.publicUrl,
  }))
}

export async function deleteDocument(path: string): Promise<void> {
  const supabase = createClient()
  await supabase.storage.from('documents').remove([path])
}
