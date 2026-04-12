import Navbar from '@/components/Web/navbar'
import React, { ReactNode } from 'react'

export default function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
