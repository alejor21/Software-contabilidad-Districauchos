'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, DollarSign, Package, ArrowLeft, Calendar } from 'lucide-react'
import Link from 'next/link'

interface BalanceItem {
  codigo: string
  nombre: string
  debe: number
  haber: number
  saldo: number
}

interface EstadoResultados {
  ingresos: number
  costoVentas: number
  gananciasBrutas: number
  margenBruto: string
  ivaVentas: number
}

export default function ReportesPage() {
  const [balance, setBalance] = useState<BalanceItem[]>([])
  const [estado, setEstado] = useState<EstadoResultados | null>(null)
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre' | 'año'>('mes')

  useEffect(() => {
    cargarReportes()
  }, [periodo])

  async function cargarReportes() {
    try {
      const hoy = new Date()
      let desde = new Date()
      
      if (periodo === 'mes') {
        desde.setMonth(desde.getMonth() - 1)
      } else if (periodo === 'trimestre') {
        desde.setMonth(desde.getMonth() - 3)
      } else {
        desde.setFullYear(desde.getFullYear() - 1)
      }

      const [balanceRes, estadoRes] = await Promise.all([
        fetch('/api/reportes/balance'),
        fetch(`/api/reportes/estado-resultados?desde=${desde.toISOString()}&hasta=${hoy.toISOString()}`)
      ])

      const balanceData = await balanceRes.json()
      const estadoData = await estadoRes.json()

      setBalance(balanceData.data || [])
      setEstado(estadoData.data || null)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const totalActivos = balance
    .filter(b => b.codigo.startsWith('1'))
    .reduce((sum, b) => sum + b.saldo, 0)

  const totalPasivos = balance
    .filter(b => b.codigo.startsWith('2'))
    .reduce((sum, b) => sum + Math.abs(b.saldo), 0)

  const totalPatrimonio = balance
    .filter(b => b.codigo.startsWith('3'))
    .reduce((sum, b) => sum + Math.abs(b.saldo), 0)

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
                Reportes Financieros
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['mes', 'trimestre', 'año'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  style={{
                    background: periodo === p ? '#6366f1' : 'white',
                    color: periodo === p ? 'white' : '#6b7280',
                    padding: '0.625rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: periodo === p ? 'none' : '2px solid #e5e7eb',
                    textTransform: 'capitalize'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem' }}>
        {/* Estado de Resultados */}
        {estado && (
          <div className="animate-fadeIn" style={{ 
            background: 'white', 
            borderRadius: '16px', 
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#dcfce7', borderRadius: '10px', padding: '0.625rem' }}>
                <TrendingUp size={24} color="#10b981" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                Estado de Resultados
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)', 
                borderRadius: '12px', 
                padding: '1.5rem',
                border: '2px solid #86efac'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <DollarSign size={20} color="#10b981" />
                  <p style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '600', margin: 0 }}>
                    INGRESOS
                  </p>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981', margin: 0 }}>
                  ${estado.ingresos.toLocaleString('es-CO')}
                </p>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)', 
                borderRadius: '12px', 
                padding: '1.5rem',
                border: '2px solid #fca5a5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Package size={20} color="#ef4444" />
                  <p style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: '600', margin: 0 }}>
                    COSTO VENTAS
                  </p>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444', margin: 0 }}>
                  ${estado.costoVentas.toLocaleString('es-CO')}
                </p>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)', 
                borderRadius: '12px', 
                padding: '1.5rem',
                border: '2px solid #93c5fd'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <TrendingUp size={20} color="#3b82f6" />
                  <p style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '600', margin: 0 }}>
                    GANANCIA BRUTA
                  </p>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6', margin: 0 }}>
                  ${estado.gananciasBrutas.toLocaleString('es-CO')}
                </p>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #eff6ff 0%, #c7d2fe 100%)', 
                borderRadius: '12px', 
                padding: '1.5rem',
                border: '2px solid #c7d2fe'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <BarChart3 size={20} color="#6366f1" />
                  <p style={{ fontSize: '0.875rem', color: '#4338ca', fontWeight: '600', margin: 0 }}>
                    MARGEN BRUTO
                  </p>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#6366f1', margin: 0 }}>
                  {estado.margenBruto}
                </p>
              </div>

              <div style={{ 
                background: 'linear-gradient(135deg, #fae8ff 0%, #e9d5ff 100%)', 
                borderRadius: '12px', 
                padding: '1.5rem',
                border: '2px solid #e9d5ff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Calendar size={20} color="#a855f7" />
                  <p style={{ fontSize: '0.875rem', color: '#6b21a8', fontWeight: '600', margin: 0 }}>
                    IVA VENTAS
                  </p>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#a855f7', margin: 0 }}>
                  ${estado.ivaVentas.toLocaleString('es-CO')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resumen Balance */}
        <div className="animate-fadeIn" style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#dbeafe', borderRadius: '10px', padding: '0.625rem' }}>
              <BarChart3 size={24} color="#3b82f6" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
              Resumen Balance General
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div style={{ 
              background: '#f0fdf4',
              borderRadius: '12px', 
              padding: '1.5rem',
              border: '2px solid #86efac'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '600', marginBottom: '0.75rem' }}>
                ACTIVOS
              </p>
              <p style={{ fontSize: '1.875rem', fontWeight: '700', color: '#10b981', margin: 0 }}>
                ${totalActivos.toLocaleString('es-CO')}
              </p>
            </div>

            <div style={{ 
              background: '#fef2f2',
              borderRadius: '12px', 
              padding: '1.5rem',
              border: '2px solid #fca5a5'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: '600', marginBottom: '0.75rem' }}>
                PASIVOS
              </p>
              <p style={{ fontSize: '1.875rem', fontWeight: '700', color: '#ef4444', margin: 0 }}>
                ${totalPasivos.toLocaleString('es-CO')}
              </p>
            </div>

            <div style={{ 
              background: '#eff6ff',
              borderRadius: '12px', 
              padding: '1.5rem',
              border: '2px solid #93c5fd'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '600', marginBottom: '0.75rem' }}>
                PATRIMONIO
              </p>
              <p style={{ fontSize: '1.875rem', fontWeight: '700', color: '#3b82f6', margin: 0 }}>
                ${totalPatrimonio.toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </div>

        {/* Balance Detallado */}
        <div className="animate-fadeIn" style={{ 
          background: 'white', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
        }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '2px solid #f3f4f6' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>
              Balance General Detallado
            </h2>
          </div>

          {balance.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <BarChart3 size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
                No hay datos disponibles
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '2px solid #f3f4f6' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      CÓDIGO
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      CUENTA
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      DEBE
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      HABER
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      SALDO
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {balance.map((item, index) => (
                    <tr 
                      key={index}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f9fafb'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white'
                      }}
                    >
                      <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', fontSize: '0.875rem', color: '#6366f1', fontWeight: '600' }}>
                        {item.codigo}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#111827' }}>
                        {item.nombre}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#6b7280' }}>
                        ${item.debe.toLocaleString('es-CO')}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#6b7280' }}>
                        ${item.haber.toLocaleString('es-CO')}
                      </td>
                      <td style={{ 
                        padding: '1rem 1.5rem', 
                        textAlign: 'right', 
                        fontWeight: '700',
                        color: item.saldo >= 0 ? '#10b981' : '#ef4444'
                      }}>
                        ${Math.abs(item.saldo).toLocaleString('es-CO')}
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
