import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { generarConsecutivo, calcularTotalesVenta, actualizarStockVenta } from '@/lib/ventas'

// GET: Listar todas las ventas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get('clienteId')
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')

    const ventas = await prisma.venta.findMany({
      where: {
        ...(clienteId && { clienteId }),
        ...(desde && hasta && {
          fecha: {
            gte: new Date(desde),
            lte: new Date(hasta)
          }
        })
      },
      include: {
        cliente: true,
        detalles: {
          include: {
            producto: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: ventas
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// POST: Crear nueva venta
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar que existan productos
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'La venta debe tener al menos un producto' },
        { status: 400 }
      )
    }

    // Generar consecutivo
    const consecutivo = await generarConsecutivo()

    // Calcular totales
    const totales = calcularTotalesVenta(body.items)

    // Aplicar descuento si existe
    const descuento = body.descuento || 0
    const totalFinal = totales.total - descuento

    // Obtener bodega principal
    const bodega = await prisma.bodega.findFirst({
      where: { nombre: 'Principal' }
    })

    if (!bodega) {
      return NextResponse.json(
        { success: false, error: 'No se encontró la bodega principal' },
        { status: 404 }
      )
    }

    // Verificar stock de todos los productos
    for (const item of body.items) {
      // Obtener producto
      const producto = await prisma.producto.findUnique({
        where: { id: item.productoId }
      })

      if (!producto) {
        return NextResponse.json(
          { success: false, error: `Producto con ID ${item.productoId} no encontrado` },
          { status: 404 }
        )
      }

      // Verificar stock
      const stock = await prisma.stock.findUnique({
        where: {
          productoId_bodegaId: {
            productoId: item.productoId,
            bodegaId: bodega.id
          }
        }
      })

      if (!stock) {
        return NextResponse.json(
          { 
            success: false, 
            error: `No hay stock registrado para ${producto.nombre}` 
          },
          { status: 400 }
        )
      }

      if (stock.cantidad < item.cantidad) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Stock insuficiente para ${producto.nombre}. Disponible: ${stock.cantidad}, Solicitado: ${item.cantidad}` 
          },
          { status: 400 }
        )
      }
    }

    // Crear la venta con sus detalles
    const venta = await prisma.venta.create({
      data: {
        consecutivo,
        clienteId: body.clienteId,
        subtotal: totales.subtotal,
        iva: totales.iva,
        descuento,
        total: totalFinal,
        metodoPago: body.metodoPago || 'EFECTIVO',
        estado: 'COMPLETADA',
        detalles: {
          create: body.items.map((item: any) => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnit: item.precioUnit,
            ivaUnit: (item.precioUnit * item.iva) / 100,
            costoUnit: item.costoUnit,
            subtotal: item.cantidad * item.precioUnit
          }))
        }
      },
      include: {
        cliente: true,
        detalles: {
          include: {
            producto: {
              include: {
                seccion: true
              }
            }
          }
        }
      }
    })

    // Actualizar stock de cada producto
    for (const item of body.items) {
      await actualizarStockVenta(
        item.productoId,
        bodega.id,
        item.cantidad,
        item.costoUnit,
        venta.id
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Venta creada exitosamente',
      data: venta
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear venta:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
