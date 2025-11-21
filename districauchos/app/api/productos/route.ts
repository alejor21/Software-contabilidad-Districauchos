import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET: Listar todos los productos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const seccion = searchParams.get('seccion')
    const busqueda = searchParams.get('q')

    const productos = await prisma.producto.findMany({
      where: {
        AND: [
          seccion ? { seccionId: seccion } : {},
          busqueda ? {
            OR: [
              { sku: { contains: busqueda, mode: 'insensitive' } },
              { nombre: { contains: busqueda, mode: 'insensitive' } },
              { marca: { contains: busqueda, mode: 'insensitive' } },
              { medida: { contains: busqueda, mode: 'insensitive' } }
            ]
          } : {},
          { activo: true }
        ]
      },
      include: {
        seccion: true,
        stock: {
          include: {
            bodega: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: productos
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST: Crear nuevo producto
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Verificar que el SKU no exista
    const existente = await prisma.producto.findUnique({
      where: { sku: body.sku }
    })
    
    if (existente) {
      return NextResponse.json(
        { success: false, error: 'El SKU ya existe' },
        { status: 400 }
      )
    }

    const producto = await prisma.producto.create({
      data: {
        sku: body.sku,
        nombre: body.nombre,
        seccionId: body.seccionId,
        marca: body.marca,
        medida: body.medida || '',
        compatibilidad: body.compatibilidad || '',
        costoPromedio: parseFloat(body.costoPromedio) || 0,
        precioBase: parseFloat(body.precioBase),
        iva: parseFloat(body.iva) || 19,
        minStock: parseInt(body.minStock) || 5
      },
      include: {
        seccion: true
      }
    })

    // Crear stock inicial en todas las bodegas
    const bodegas = await prisma.bodega.findMany()
    const stockInicial = parseInt(body.stockInicial) || 0
    
    for (const bodega of bodegas) {
      await prisma.stock.create({
        data: {
          productoId: producto.id,
          bodegaId: bodega.id,
          cantidad: stockInicial
        }
      })

      if (stockInicial > 0) {
        await prisma.movimiento.create({
          data: {
            tipo: 'ENTRADA',
            productoId: producto.id,
            bodegaId: bodega.id,
            cantidad: stockInicial,
            costoUnit: parseFloat(body.costoPromedio) || 0,
            observacion: 'Stock inicial'
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: producto
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT: Actualizar producto
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      )
    }

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        nombre: data.nombre,
        marca: data.marca,
        medida: data.medida || '',
        compatibilidad: data.compatibilidad || '',
        costoPromedio: data.costoPromedio ? parseFloat(data.costoPromedio) : undefined,
        precioBase: data.precioBase ? parseFloat(data.precioBase) : undefined,
        iva: data.iva ? parseFloat(data.iva) : undefined,
        minStock: data.minStock ? parseInt(data.minStock) : undefined,
        activo: data.activo !== undefined ? data.activo : undefined
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
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      )
    }

    const producto = await prisma.producto.update({
      where: { id },
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

