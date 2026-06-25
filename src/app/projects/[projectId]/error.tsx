'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ProjectError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('[Project Error]', error)
  }, [error])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-4">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">
          {error.message && !error.message.includes('omitted')
            ? error.message
            : 'An error occurred while loading this project.'}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={unstable_retry}>
            Try again
          </Button>
          <Button asChild>
            <Link href="/">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
