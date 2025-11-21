'use client'

import { useState, useEffect } from 'react'
import { Search, Package, AlertCircle, TrendingDown, BarChart3, ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Producto {
  id: string
  nombre: string
  sku: string
  marca: string
  precioBase: string
  costoPromedio: string
  stock: Array<{ cantidad: number }>
  minStock: number
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<'todos' | 'bajo-stock' | 'sin-stock'>('todos')

  useEffect(() => {
    cargarProductos()
  }, [])

  async function cargarProductos() {
    try {
      const res = await fetch('/api/productos')
      const data = await res.json()
      setProductos(data.data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function eliminarProducto(id: string) {
    if (!confirm('¿Está seguro de desactivar este producto?')) return

    try {
      const res = await fetch(`/api/productos/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        cargarProductos()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const productosFiltrados = productos.filter(p => {
    const stock = p.stock[0]?.cantidad || 0
    const coincideBusqueda = 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.marca.toLowerCase().includes(busqueda.toLowerCase())

    if (!coincideBusqueda) return false

    if (filtro === 'bajo-stock') return stock > 0 && stock < p.minStock
    if (filtro === 'sin-stock') return stock === 0
    return true
  })

  const stats = {
    total: productos.length,
    bajoStock: productos.filter(p => {
      const stock = p.stock[0]?.cantidad || 0
      return stock > 0 && stock < p.minStock
    }).length,
    sinStock: productos.filter(p => (p.stock[0]?.cantidad || 0) === 0).length
  }

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
                Inventario de Productos
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link 
                href="/productos/crear"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  boxShadow: '0 4px 6px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(102, 126, 234, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(102, 126, 234, 0.4)'
                }}
              >
                <Plus size={20} />
                Nuevo Producto
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Package size={24} color="#6366f1" />
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#6366f1' }}>
                  {stats.total} productos
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem' }}>
        {/* Estadísticas */}
        <div className="animate-fadeIn" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Productos</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: 0 }}>{stats.total}</p>
              </div>
              <div style={{ background: '#dbeafe', borderRadius: '12px', padding: '0.75rem' }}>
                <BarChart3 size={28} color="#3b82f6" />
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Bajo Stock</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b', margin: 0 }}>{stats.bajoStock}</p>
              </div>
              <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '0.75rem' }}>
                <TrendingDown size={28} color="#f59e0b" />
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Sin Stock</p>
                <p style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444', margin: 0 }}>{stats.sinStock}</p>
              </div>
              <div style={{ background: '#fee2e2', borderRadius: '12px', padding: '0.75rem' }}>
                <AlertCircle size={28} color="#ef4444" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="animate-fadeIn" style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '1.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search 
                size={20} 
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} 
              />
              <input
                type="text"
                placeholder="Buscar por nombre, SKU o marca..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setFiltro('todos')}
                style={{
                  background: filtro === 'todos' ? '#6366f1' : 'white',
                  color: filtro === 'todos' ? 'white' : '#6b7280',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: filtro === 'todos' ? 'none' : '2px solid #e5e7eb'
                }}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltro('bajo-stock')}
                style={{
                  background: filtro === 'bajo-stock' ? '#f59e0b' : 'white',
                  color: filtro === 'bajo-stock' ? 'white' : '#6b7280',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: filtro === 'bajo-stock' ? 'none' : '2px solid #e5e7eb'
                }}
              >
                Bajo Stock
              </button>
              <button
                onClick={() => setFiltro('sin-stock')}
                style={{
                  background: filtro === 'sin-stock' ? '#ef4444' : 'white',
                  color: filtro === 'sin-stock' ? 'white' : '#6b7280',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  border: filtro === 'sin-stock' ? 'none' : '2px solid #e5e7eb'
                }}
              >
                Sin Stock
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="animate-fadeIn" style={{ 
          background: 'white', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
        }}>
          {productosFiltrados.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <Package size={48} color="#d1d5db" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
                No se encontraron productos
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6', background: '#fafafa' }}>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      SKU
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      PRODUCTO
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      MARCA
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      STOCK
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      COSTO
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      PRECIO
                    </th>
                    <th style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>
                      ACCIONES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map(p => {
                    const stock = p.stock[0]?.cantidad || 0
                    const bajoStock = stock > 0 && stock < p.minStock
                    const sinStock = stock === 0
                    
                    return (
                      <tr 
                        key={p.id} 
                        style={{
                          borderBottom: '1px solid #f3f4f6',
                          background: sinStock ? '#fef2f2' : bajoStock ? '#fffbeb' : 'white',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f9fafb'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = sinStock ? '#fef2f2' : bajoStock ? '#fffbeb' : 'white'
                        }}
                      >
                        <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', fontSize: '0.875rem', color: '#6366f1', fontWeight: '600' }}>
                          {p.sku}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#111827' }}>
                          {p.nombre}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: '#6b7280' }}>
                          {p.marca}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                          <span style={{
                            background: sinStock ? '#fee2e2' : bajoStock ? '#fef3c7' : '#dcfce7',
                            color: sinStock ? '#ef4444' : bajoStock ? '#f59e0b' : '#10b981',
                            padding: '0.375rem 0.875rem',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: '700'
                          }}>
                            {stock}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#6b7280' }}>
                          ${Number(p.costoPromedio).toLocaleString('es-CO')}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: '700', color: '#111827', fontSize: '1.0rem' }}>
                          ${Number(p.precioBase).toLocaleString('es-CO')}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <Link
                              href={`/productos/${p.id}/editar`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.5rem 1rem',
                                background: '#3b82f6',
                                color: 'white',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#2563eb'
                                e.currentTarget.style.transform = 'scale(1.05)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#3b82f6'
                                e.currentTarget.style.transform = 'scale(1)'
                              }}
                            >
                              <Edit size={16} />
                              Editar
                            </Link>
                            <button
                              onClick={() => eliminarProducto(p.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.5rem 1rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#dc2626'
                                e.currentTarget.style.transform = 'scale(1.05)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ef4444'
                                e.currentTarget.style.transform = 'scale(1)'
                              }}
                            >
                              <Trash2 size={16} />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
