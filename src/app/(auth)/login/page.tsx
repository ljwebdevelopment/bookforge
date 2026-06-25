import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'Sign In — BookForge',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold">
            B
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">BookForge</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your private writing workspace</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
