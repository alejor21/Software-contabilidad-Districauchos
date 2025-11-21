import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET: Obtener producto por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: params.id },
      include: {
        seccion: true,
        stock: {
          include: {
            bodega: true
          }
        }
      }
    })

    if (!producto) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: producto
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT: Actualizar producto específico
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const producto = await prisma.producto.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre,
        marca: body.marca,
        medida: body.medida || '',
        compatibilidad: body.compatibilidad || '',
        costoPromedio: body.costoPromedio ? parseFloat(body.costoPromedio) : undefined,
        precioBase: body.precioBase ? parseFloat(body.precioBase) : undefined,
        iva: body.iva ? parseFloat(body.iva) : undefined,
        minStock: body.minStock ? parseInt(body.minStock) : undefined
      },
      include: {
        seccion: true,
        stock: {
          include: {
            bodega: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: producto
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE: Desactivar producto
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const producto = await prisma.producto.update({
      where: { id: params.id },
      data: { activo: false }
    })

    return NextResponse.json({
      success: true,
      data: producto
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
