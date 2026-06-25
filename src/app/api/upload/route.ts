import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const projectId = formData.get('projectId') as string | null

  if (!file || !projectId) return new Response('Missing file or projectId', { status: 400 })

  const ext = file.name.split('.').pop()
  const filename = `${projectId}/${crypto.randomUUID()}.${ext}`

  const { data, error } = await supabase.storage
    .from('research')
    .upload(filename, file, { contentType: file.type })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('research').getPublicUrl(filename)

  return Response.json({ url: publicUrl, path: data.path })
}
