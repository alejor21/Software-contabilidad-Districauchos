'use client'

import { useState, useEffect } from 'react'
import { Download, Plus, FileText, Calendar, DollarSign, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Venta {
  id: string
  consecutivo: string
  cliente: { nombre: string }
  total: string
  fecha: string
}

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    cargarVentas()
  }, [])

  async function cargarVentas() {
    try {
      const res = await fetch('/api/ventas')
      const data = await res.json()
      setVentas(data.data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function descargarPDF(ventaId: string, consecutivo: string) {
    try {
      const res = await fetch(`/api/ventas/${ventaId}/pdf`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `factura-${consecutivo}.pdf`
      a.click()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al descargar el PDF')
    }
  }

  const ventasFiltradas = ventas.filter(v =>
    v.consecutivo.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total), 0)
  const ventasHoy = ventas.filter(v => {
    const hoy = new Date()
    const fechaVenta = new Date(v.fecha)
    return fechaVenta.toDateString() === hoy.toDateString()
  }).length

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '1.25rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/dashboard" style={{ color: '#6366f1', display: 'flex', alignItems: 'center' }}>
                <ArrowLeft size={24} />
              </Link>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                Gestión de Ventas
              </h1>
            </div>
            <Link 
              href="/ventas/crear"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                textDecoration: 'none'
              }}
            >
              <Plus size={20} />
              Nueva Venta
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem' }}>
        {/* Estadísticas */}
        <div className="animate-fadeIn" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Ventas</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: 0 }}>{ventas.length}</p>
              </div>
              <div style={{ background: '#dbeafe', borderRadius: '12px', padding: '0.75rem' }}>
                <FileText size={28} color="#3b82f6" />
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Ventas Hoy</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981', margin: 0 }}>{ventasHoy}</p>
              </div>
              <div style={{ background: '#dcfce7', borderRadius: '12px', padding: '0.75rem' }}>
                <Calendar size={28} color="#10b981" />
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Ingresos</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#6366f1', margin: 0 }}>
                  ${totalVentas.toLocaleString('es-CO')}
                </p>
              </div>
              <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '0.75rem' }}>
                <DollarSign size={28} color="#6366f1" />
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="animate-fadeIn" style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '2rem'
        }}>
          <input
            type="text"
            placeholder="Buscar por factura o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '1rem',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Tabla de Ventas */}
        <div className="animate-fadeIn" style={{ 
          background: 'white', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
        }}>
          {ventasFiltradas.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <FileText size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: '#9ca3af', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                {ventas.length === 0 ? 'No hay ventas registradas' : 'No se encontraron ventas'}
              </p>
              {ventas.length === 0 && (
                <Link
                  href="/ventas/crear"
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    background: '#6366f1',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  Crear Primera Venta
                </Link>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6', background: '#fafafa' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      FACTURA
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      CLIENTE
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      FECHA
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      TOTAL
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      ACCIONES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.map((venta, index) => (
                    <tr 
                      key={venta.id}
                      className="animate-fadeIn"
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'all 0.2s',
                        animationDelay: `${index * 0.05}s`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f9fafb'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white'
                      }}
                    >
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          background: '#eff6ff',
                          color: '#6366f1',
                          padding: '0.375rem 0.875rem',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontFamily: 'monospace',
                          fontSize: '0.95rem'
                        }}>
                          {venta.consecutivo}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ background: '#f3f4f6', borderRadius: '50%', padding: '0.5rem' }}>
                            <User size={16} color="#6b7280" />
                          </div>
                          <span style={{ fontWeight: '600', color: '#111827' }}>{venta.cliente.nombre}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: '#6b7280' }}>
                        {new Date(venta.fecha).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '700', color: '#10b981', fontSize: '1.0rem' }}>
                        ${Number(venta.total).toLocaleString('es-CO')}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                        <button
                          onClick={() => descargarPDF(venta.id, venta.consecutivo)}
                          style={{
                            background: '#6366f1',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
                          }}
                        >
                          <Download size={16} />
                          PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
