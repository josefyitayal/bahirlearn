import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white/90 dark:bg-muted/70 backdrop-blur p-6 shadow-xl">
        <SignUp />
      </div>
    </div>
  )
}
