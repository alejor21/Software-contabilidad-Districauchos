import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DISTRICAUCHOS - Sistema de Gestión',
  description: 'Sistema de gestión y contabilidad para Districauchos del Sur'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
