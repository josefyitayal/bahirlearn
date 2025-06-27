import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function OnboardingLayoutPage({ children }) {
  if ((await auth()).sessionClaims?.metadata.onboardingComplete === true) {
    redirect('/')
  }

  return <>{children}</>
}