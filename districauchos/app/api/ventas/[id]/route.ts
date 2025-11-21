import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { id } = params

    const venta = await prisma.venta.findUnique({
      where: { id },
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

    if (!venta) {
      return NextResponse.json(
        { success: false, error: 'Venta no encontrada' },
        { status: 404 }
      )
    }
        // Registrar asientos contables DESPUÉS de crear la venta
    try {
      const { registrarVentaContable } = await import('@/lib/contabilidad')
      await registrarVentaContable(venta.id)
    } catch (error) {
      console.error('Advertencia: Error al crear asientos contables:', error)
      // No fallar la venta si falla la contabilidad
    }


    return NextResponse.json({
      success: true,
      data: venta
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
