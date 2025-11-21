'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, DollarSign, ShoppingCart, TrendingUp, Package, BarChart3, Plus, ArrowRight } from 'lucide-react'

interface Stats {
  totalVentas: number
  ventasMes: number
  productosActivos: number
  ventasRecientes: Array<{
    consecutivo: string
    cliente: { nombre: string }
    total: string
    fecha: string
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalVentas: 0,
    ventasMes: 0,
    productosActivos: 0,
    ventasRecientes: []
  })

  useEffect(() => {
    cargarStats()
  }, [])

  async function cargarStats() {
    try {
      const [ventasRes, productosRes] = await Promise.all([
        fetch('/api/ventas'),
        fetch('/api/productos')
      ])

      const ventasData = await ventasRes.json()
      const productosData = await productosRes.json()

      const ventas = ventasData.data || []
      const productos = productosData.data || []

      const hoy = new Date()
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

      const ventasMes = ventas.filter((v: any) => 
        new Date(v.fecha) >= primerDiaMes
      )

      setStats({
        totalVentas: ventas.reduce((sum: number, v: any) => sum + Number(v.total), 0),
        ventasMes: ventasMes.length,
        productosActivos: productos.length,
        ventasRecientes: ventas.slice(0, 5)
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header Mejorado */}
      <header style={{ 
        background: 'white', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 0.25rem 0' }}>
                Panel de Control
              </h1>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>
                Bienvenido al sistema de gestión Districauchos
              </p>
            </div>
            <Link
              href="/ventas/crear"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '0.875rem 1.75rem',
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
        {/* Tarjetas de Estadísticas Mejoradas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="animate-fadeIn" style={{ 
            background: 'linear-gradient(135deg, #fff 0%, #f0f9ff 100%)', 
            borderRadius: '16px', 
            padding: '1.75rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            border: '1px solid #e0f2fe'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ background: '#dbeafe', borderRadius: '12px', padding: '0.875rem' }}>
                <DollarSign size={28} color="#3b82f6" />
              </div>
              <span style={{ 
                background: '#dcfce7', 
                color: '#166534', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px', 
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                Total
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Ventas
            </p>
            <p style={{ fontSize: '2.25rem', fontWeight: '700', color: '#111827', margin: 0, lineHeight: 1 }}>
              ${stats.totalVentas.toLocaleString('es-CO')}
            </p>
          </div>

          <div className="animate-fadeIn" style={{ 
            background: 'linear-gradient(135deg, #fff 0%, #f0fdf4 100%)', 
            borderRadius: '16px', 
            padding: '1.75rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            border: '1px solid #dcfce7',
            animationDelay: '0.1s'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ background: '#dcfce7', borderRadius: '12px', padding: '0.875rem' }}>
                <TrendingUp size={28} color="#22c55e" />
              </div>
              <span style={{ 
                background: '#dbeafe', 
                color: '#1e40af', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px', 
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                Este Mes
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ventas del Mes
            </p>
            <p style={{ fontSize: '2.25rem', fontWeight: '700', color: '#111827', margin: 0, lineHeight: 1 }}>
              {stats.ventasMes}
            </p>
          </div>

          <div className="animate-fadeIn" style={{ 
            background: 'linear-gradient(135deg, #fff 0%, #fefce8 100%)', 
            borderRadius: '16px', 
            padding: '1.75rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            border: '1px solid #fef3c7',
            animationDelay: '0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '0.875rem' }}>
                <Package size={28} color="#f59e0b" />
              </div>
              <span style={{ 
                background: '#eff6ff', 
                color: '#1e40af', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px', 
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                Activo
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Productos Activos
            </p>
            <p style={{ fontSize: '2.25rem', fontWeight: '700', color: '#111827', margin: 0, lineHeight: 1 }}>
              {stats.productosActivos}
            </p>
          </div>
        </div>

        {/* Ventas Recientes */}
        <div className="animate-fadeIn" style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '0.625rem' }}>
                <FileText size={24} color="#6366f1" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: '0' }}>
                Últimas Ventas
              </h2>
            </div>
            <Link 
              href="/ventas"
              style={{
                color: '#6366f1',
                fontSize: '0.95rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                textDecoration: 'none'
              }}
            >
              Ver todas
              <ArrowRight size={16} />
            </Link>
          </div>
          
          {stats.ventasRecientes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <FileText size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: '#9ca3af', fontSize: '1.125rem', marginBottom: '1rem' }}>
                No hay ventas registradas aún
              </p>
              <Link
                href="/ventas/crear"
                style={{
                  display: 'inline-block',
                  background: '#6366f1',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                Crear primera venta
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280', fontSize: '0.875rem' }}>FACTURA</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280', fontSize: '0.875rem' }}>CLIENTE</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: '600', color: '#6b7280', fontSize: '0.875rem' }}>FECHA</th>
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: '600', color: '#6b7280', fontSize: '0.875rem' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.ventasRecientes.map((venta, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ 
                          background: '#eff6ff', 
                          color: '#6366f1', 
                          padding: '0.375rem 0.75rem', 
                          borderRadius: '6px',
                          fontWeight: '700',
                          fontFamily: 'monospace',
                          fontSize: '0.875rem'
                        }}>
                          {venta.consecutivo}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#111827', fontWeight: '600' }}>{venta.cliente.nombre}</td>
                      <td style={{ padding: '0.875rem 1rem', color: '#6b7280' }}>
                        {new Date(venta.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: '700', color: '#10b981' }}>
                        ${Number(venta.total).toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Enlaces Rápidos Mejorados */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <Link 
            href="/ventas/crear"
            className="animate-scaleIn"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '1.75rem',
              borderRadius: '16px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}
          >
            <div>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: '0 0 0.5rem 0' }}>Crear</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Nueva Venta</p>
            </div>
            <Plus size={28} />
          </Link>

          <Link 
            href="/productos"
            className="animate-scaleIn"
            style={{
              background: 'white',
              color: '#111827',
              padding: '1.75rem',
              borderRadius: '16px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              border: '2px solid #f3f4f6',
              transition: 'all 0.3s',
              animationDelay: '0.1s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = '#6366f1'
              e.currentTarget.style.boxShadow = '0 8px 14px rgba(99, 102, 241, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = '#f3f4f6'
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)'
            }}
          >
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>Gestionar</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Productos</p>
            </div>
            <Package size={28} color="#6366f1" />
          </Link>

          <Link 
            href="/reportes"
            className="animate-scaleIn"
            style={{
              background: 'white',
              color: '#111827',
              padding: '1.75rem',
              borderRadius: '16px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              border: '2px solid #f3f4f6',
              transition: 'all 0.3s',
              animationDelay: '0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.borderColor = '#10b981'
              e.currentTarget.style.boxShadow = '0 8px 14px rgba(16, 185, 129, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.borderColor = '#f3f4f6'
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)'
            }}
          >
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>Ver</p>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Reportes</p>
            </div>
            <BarChart3 size={28} color="#10b981" />
          </Link>
        </div>
      </main>
    </div>
  )
}
