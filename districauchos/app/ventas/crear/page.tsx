'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Search, ShoppingCart, X, Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Producto {
  id: string
  nombre: string
  sku: string
  marca: string
  precioBase: string
  iva: string
  costoPromedio: string
  stock: Array<{ cantidad: number }>
}

interface Cliente {
  id: string
  nombre: string
}

interface ItemVenta {
  productoId: string
  cantidad: number
  precioUnit: number
  iva: number
  costoUnit: number
}

export default function CrearVentaPage() {
  const router = useRouter()
  const [productos, setProductos] = useState<Producto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState('')
  const [items, setItems] = useState<ItemVenta[]>([])
  const [loading, setLoading] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarProductos, setMostrarProductos] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      const [productosRes, clientesRes] = await Promise.all([
        fetch('/api/productos'),
        fetch('/api/clientes')
      ])
      const productosData = await productosRes.json()
      const clientesData = await clientesRes.json()
      setProductos(productosData.data || [])
      setClientes(clientesData.data || [])
      if (clientesData.data?.length > 0) {
        setClienteId(clientesData.data[0].id)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.marca.toLowerCase().includes(busqueda.toLowerCase())
  )

  function agregarItem(producto: Producto) {
    const existente = items.findIndex(i => i.productoId === producto.id)
    
    if (existente >= 0) {
      const nuevosItems = [...items]
      nuevosItems[existente].cantidad += 1
      setItems(nuevosItems)
    } else {
      const nuevoItem: ItemVenta = {
        productoId: producto.id,
        cantidad: 1,
        precioUnit: Number(producto.precioBase),
        iva: Number(producto.iva),
        costoUnit: Number(producto.costoPromedio)
      }
      setItems([...items, nuevoItem])
    }
    setBusqueda('')
  }

  function actualizarCantidad(index: number, cantidad: number) {
    if (cantidad < 1) return
    const nuevosItems = [...items]
    nuevosItems[index].cantidad = cantidad
    setItems(nuevosItems)
  }

  function actualizarPrecio(index: number, precio: number) {
    if (precio < 0) return
    const nuevosItems = [...items]
    nuevosItems[index].precioUnit = precio
    setItems(nuevosItems)
  }

  function eliminarItem(index: number) {
    setItems(items.filter((_, i) => i !== index))
  }

  async function crearVenta() {
    if (!clienteId || items.length === 0) {
      alert('⚠️ Selecciona un cliente y agrega productos')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId,
          items,
          metodoPago: 'EFECTIVO',
          descuento: 0
        })
      })

      const data = await res.json()

      if (data.success) {
        alert(`✅ Venta ${data.data.consecutivo} creada exitosamente`)
        router.push('/ventas')
      } else {
        alert(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      alert('❌ Error al crear la venta')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (item.cantidad * item.precioUnit), 0)
  const totalIva = items.reduce((sum, item) => sum + (item.cantidad * item.precioUnit * item.iva / 100), 0)
  const total = subtotal + totalIva

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
              <Link href="/ventas" style={{ color: '#6366f1', display: 'flex', alignItems: 'center' }}>
                <ArrowLeft size={24} />
              </Link>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                Nueva Venta
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShoppingCart size={24} color="#6366f1" />
              <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#6366f1' }}>
                {items.length} productos
              </span>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
          {/* Columna Principal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Cliente */}
            <div className="animate-fadeIn" style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '1.75rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
            }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Cliente
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            {/* Buscador de Productos */}
            <div className="animate-fadeIn" style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '1.75rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Buscar Productos
                </h2>
                <button
                  onClick={() => setMostrarProductos(!mostrarProductos)}
                  style={{
                    background: mostrarProductos ? '#6366f1' : '#e5e7eb',
                    color: mostrarProductos ? 'white' : '#6b7280',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}
                >
                  {mostrarProductos ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              <div style={{ position: 'relative', marginBottom: '1rem' }}>
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

              {mostrarProductos && (
                <div style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  display: 'grid',
                  gap: '0.75rem'
                }}>
                  {productosFiltrados.map(p => {
                    const stock = p.stock[0]?.cantidad || 0
                    const enCarrito = items.find(i => i.productoId === p.id)
                    
                    return (
                      <div 
                        key={p.id} 
                        className="animate-fadeIn"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem',
                          border: enCarrito ? '2px solid #6366f1' : '2px solid #f3f4f6',
                          borderRadius: '10px',
                          background: enCarrito ? '#eff6ff' : '#fafafa',
                          transition: 'all 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (!enCarrito) e.currentTarget.style.borderColor = '#e5e7eb'
                        }}
                        onMouseLeave={(e) => {
                          if (!enCarrito) e.currentTarget.style.borderColor = '#f3f4f6'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <p style={{ fontWeight: '600', color: '#111827', margin: 0 }}>{p.nombre}</p>
                            {enCarrito && (
                              <span style={{
                                background: '#6366f1',
                                color: 'white',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                ×{enCarrito.cantidad}
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                            <span>SKU: {p.sku}</span>
                            <span>•</span>
                            <span>{p.marca}</span>
                            <span>•</span>
                            <span style={{ color: stock > 0 ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                              Stock: {stock}
                            </span>
                          </div>
                          <p style={{ fontSize: '1.125rem', fontWeight: '700', color: '#6366f1', margin: '0.25rem 0 0 0' }}>
                            ${Number(p.precioBase).toLocaleString('es-CO')}
                          </p>
                        </div>
                        <button
                          onClick={() => agregarItem(p)}
                          disabled={stock === 0}
                          style={{
                            background: stock === 0 ? '#d1d5db' : enCarrito ? '#10b981' : '#6366f1',
                            color: 'white',
                            padding: '0.75rem',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '44px',
                            cursor: stock === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {enCarrito ? <Check size={20} /> : <Plus size={20} />}
                        </button>
                      </div>
                    )
                  })}
                  {productosFiltrados.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                      No se encontraron productos
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Items del Carrito */}
            {items.length > 0 && (
              <div className="animate-scaleIn" style={{ 
                background: 'white', 
                borderRadius: '16px', 
                padding: '1.75rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
              }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  Productos en el Carrito ({items.length})
                </h2>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {items.map((item, idx) => {
                    const producto = productos.find(p => p.id === item.productoId)
                    if (!producto) return null
                    
                    return (
                      <div 
                        key={idx}
                        className="animate-slideIn"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto auto auto',
                          gap: '1rem',
                          alignItems: 'center',
                          padding: '1rem',
                          background: '#f9fafb',
                          borderRadius: '10px',
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: '600', color: '#111827', margin: '0 0 0.25rem 0' }}>
                            {producto.nombre}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                            {producto.marca} • SKU: {producto.sku}
                          </p>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Cant:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => actualizarCantidad(idx, parseInt(e.target.value) || 1)}
                            style={{
                              width: '70px',
                              padding: '0.5rem',
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              textAlign: 'center',
                              fontWeight: '600'
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>$</label>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={item.precioUnit}
                            onChange={(e) => actualizarPrecio(idx, parseFloat(e.target.value) || 0)}
                            style={{
                              width: '120px',
                              padding: '0.5rem',
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              textAlign: 'right',
                              fontWeight: '600',
                              color: '#6366f1'
                            }}
                          />
                        </div>

                        <button
                          onClick={() => eliminarItem(idx)}
                          style={{
                            background: '#fee2e2',
                            color: '#ef4444',
                            padding: '0.625rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Resumen - Sticky Sidebar */}
          <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div className="animate-scaleIn" style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '2rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
                Resumen de Venta
              </h2>
              
              <div style={{ 
                borderBottom: '2px solid #f3f4f6', 
                paddingBottom: '1.5rem', 
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                  <span style={{ color: '#6b7280' }}>Subtotal:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>
                    ${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                  <span style={{ color: '#6b7280' }}>IVA:</span>
                  <span style={{ fontWeight: '600', color: '#111827' }}>
                    ${totalIva.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <div style={{ 
                background: '#eff6ff', 
                padding: '1.25rem', 
                borderRadius: '12px', 
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>Total:</span>
                  <span style={{ fontSize: '2rem', fontWeight: '700', color: '#6366f1' }}>
                    ${total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <button
                onClick={crearVenta}
                disabled={loading || items.length === 0}
                style={{
                  width: '100%',
                  background: items.length === 0 ? '#d1d5db' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '12px',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: items.length > 0 ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none',
                  marginBottom: '0.75rem'
                }}
              >
                {loading ? '⏳ Procesando...' : '✓ Crear Venta'}
              </button>

              <Link 
                href="/ventas"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  padding: '0.75rem',
                  transition: 'color 0.2s'
                }}
              >
                Cancelar
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
