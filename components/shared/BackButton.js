"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

function BackButton() {
    const router = useRouter()
  return (
    <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft />
    </Button>
  )
}

export default BackButton
