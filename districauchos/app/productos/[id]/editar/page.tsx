'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Package, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Producto {
  id: string
  sku: string
  nombre: string
  seccionId: string
  marca: string
  medida: string
  compatibilidad: string
  costoPromedio: number
  precioBase: number
  iva: number
  minStock: number
  stock: Array<{
    cantidad: number
    bodega: {
      nombre: string
    }
  }>
}

export default function EditarProducto({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [producto, setProducto] = useState<Producto | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    marca: '',
    medida: '',
    compatibilidad: '',
    costoPromedio: '',
    precioBase: '',
    iva: '',
    minStock: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    cargarProducto()
  }, [params.id])

  const cargarProducto = async () => {
    try {
      const res = await fetch(`/api/productos/${params.id}`)
      const data = await res.json()
      
      if (data.success) {
        setProducto(data.data)
        setFormData({
          nombre: data.data.nombre,
          marca: data.data.marca,
          medida: data.data.medida || '',
          compatibilidad: data.data.compatibilidad || '',
          costoPromedio: data.data.costoPromedio.toString(),
          precioBase: data.data.precioBase.toString(),
          iva: data.data.iva.toString(),
          minStock: data.data.minStock.toString()
        })
      } else {
        setError('Producto no encontrado')
      }
    } catch (error) {
      console.error('Error al cargar producto:', error)
      setError('Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const res = await fetch(`/api/productos/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        router.push('/productos')
        router.refresh()
      } else {
        setError(data.error || 'Error al actualizar el producto')
      }
    } catch (error: any) {
      setError('Error al actualizar el producto: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async () => {
    if (!confirm('¿Está seguro de desactivar este producto?')) return

    try {
      const res = await fetch(`/api/productos/${params.id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        router.push('/productos')
        router.refresh()
      } else {
        setError(data.error || 'Error al desactivar el producto')
      }
    } catch (error: any) {
      setError('Error al desactivar el producto: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/productos"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Productos
          </Link>
        </div>
      </div>
    )
  }

  const totalStock = producto.stock.reduce((sum, s) => sum + s.cantidad, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/productos"
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Package className="w-8 h-8" />
                  Editar Producto
                </h1>
                <p className="text-indigo-100 mt-1">SKU: {producto.sku}</p>
              </div>
            </div>
            <button
              onClick={handleEliminar}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-all flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Desactivar
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Stock Actual */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Actual</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Total en Inventario</p>
              <p className="text-3xl font-bold text-indigo-600">{totalStock}</p>
            </div>
            {producto.stock.map((s, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{s.bodega.nombre}</p>
                <p className="text-2xl font-semibold text-gray-900">{s.cantidad} unidades</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded"></div>
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medida
                  </label>
                  <input
                    type="text"
                    name="medida"
                    value={formData.medida}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compatibilidad
                  </label>
                  <textarea
                    name="compatibilidad"
                    value={formData.compatibilidad}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Precios */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded"></div>
                Precios
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costo Promedio
                  </label>
                  <input
                    type="number"
                    name="costoPromedio"
                    value={formData.costoPromedio}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Base <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="precioBase"
                    value={formData.precioBase}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IVA (%)
                  </label>
                  <input
                    type="number"
                    name="iva"
                    value={formData.iva}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Stock */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded"></div>
                Inventario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t">
              <Link
                href="/productos"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-center font-medium"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
