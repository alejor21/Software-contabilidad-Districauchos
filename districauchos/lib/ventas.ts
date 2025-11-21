import { prisma } from './prisma'
import { Decimal } from '@prisma/client/runtime/library'

// Generar consecutivo de venta
export async function generarConsecutivo(): Promise<string> {
  const ultimaVenta = await prisma.venta.findFirst({
    orderBy: { consecutivo: 'desc' }
  })

  if (!ultimaVenta) {
    return 'V-0001'
  }

  const numero = parseInt(ultimaVenta.consecutivo.split('-')[1]) + 1
  return `V-${numero.toString().padStart(4, '0')}`
}

// Calcular totales de venta
export function calcularTotalesVenta(items: Array<{
  cantidad: number
  precioUnit: number
  iva: number
}>) {
  let subtotal = 0
  let totalIva = 0

  items.forEach(item => {
    const subtotalItem = item.cantidad * item.precioUnit
    const ivaItem = (subtotalItem * item.iva) / 100
    subtotal += subtotalItem
    totalIva += ivaItem
  })

  return {
    subtotal,
    iva: totalIva,
    total: subtotal + totalIva
  }
}

// Actualizar stock después de venta
export async function actualizarStockVenta(
  productoId: string,
  bodegaId: string,
  cantidad: number,
  costoUnit: number,
  ventaId: string
) {
  // Reducir stock
  await prisma.stock.update({
    where: {
      productoId_bodegaId: {
        productoId,
        bodegaId
      }
    },
    data: {
      cantidad: {
        decrement: cantidad
      }
    }
  })

  // Registrar movimiento
  await prisma.movimiento.create({
    data: {
      tipo: 'SALIDA',
      productoId,
      bodegaId,
      cantidad: -cantidad,
      costoUnit,
      refDoc: ventaId,
      observacion: `Venta ${ventaId}`
    }
  })
}
