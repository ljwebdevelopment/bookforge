'use client'

import { useRef, useState, useTransition } from 'react'
import { Upload, Link, Quote, FileText, Image, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createResearchItem } from '@/actions/research-actions'
import { toast } from 'sonner'

interface ResearchUploadProps {
  projectId: string
  onCreated: () => void
}

export function ResearchUpload({ projectId, onCreated }: ResearchUploadProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('projectId', projectId)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      const type = file.type.includes('pdf') ? 'pdf' : 'image'
      await createResearchItem(projectId, type, { title: file.name, file_url: data.url })
      toast.success('File uploaded')
      setOpen(false)
      onCreated()
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleLink = () => {
    if (!url.trim()) return
    startTransition(async () => {
      await createResearchItem(projectId, 'link', { title: title || url, url })
      toast.success('Link saved')
      setUrl('')
      setTitle('')
      setOpen(false)
      onCreated()
    })
  }

  const handleQuote = () => {
    if (!content.trim()) return
    startTransition(async () => {
      await createResearchItem(projectId, 'quote', { title: title || 'Quote', content })
      toast.success('Quote saved')
      setContent('')
      setTitle('')
      setOpen(false)
      onCreated()
    })
  }

  const handleNote = () => {
    if (!content.trim()) return
    startTransition(async () => {
      await createResearchItem(projectId, 'note', { title: title || 'Note', content })
      toast.success('Note saved')
      setContent('')
      setTitle('')
      setOpen(false)
      onCreated()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Add research
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Research Library</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="file">
          <TabsList className="w-full">
            <TabsTrigger value="file" className="flex-1">File</TabsTrigger>
            <TabsTrigger value="link" className="flex-1">Link</TabsTrigger>
            <TabsTrigger value="quote" className="flex-1">Quote</TabsTrigger>
            <TabsTrigger value="note" className="flex-1">Note</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4 pt-4">
            <div
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload PDF or image</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 10MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />
          </TabsContent>

          <TabsContent value="link" className="space-y-3 pt-4">
            <div><Label>URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="mt-1.5" /></div>
            <div><Label>Title (optional)</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Link title" className="mt-1.5" /></div>
            <DialogFooter><Button onClick={handleLink} disabled={!url.trim() || isPending}>Save link</Button></DialogFooter>
          </TabsContent>

          <TabsContent value="quote" className="space-y-3 pt-4">
            <div><Label>Quote text</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Enter the quote..." className="mt-1.5 min-h-[100px]" /></div>
            <div><Label>Source (optional)</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Author or source" className="mt-1.5" /></div>
            <DialogFooter><Button onClick={handleQuote} disabled={!content.trim() || isPending}>Save quote</Button></DialogFooter>
          </TabsContent>

          <TabsContent value="note" className="space-y-3 pt-4">
            <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" className="mt-1.5" /></div>
            <div><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your research note..." className="mt-1.5 min-h-[120px]" /></div>
            <DialogFooter><Button onClick={handleNote} disabled={!content.trim() || isPending}>Save note</Button></DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
