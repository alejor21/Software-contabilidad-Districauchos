import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET: Listar todos los clientes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const busqueda = searchParams.get('q')

    const clientes = await prisma.cliente.findMany({
      where: busqueda ? {
        OR: [
          { nit: { contains: busqueda, mode: 'insensitive' } },
          { nombre: { contains: busqueda, mode: 'insensitive' } },
          { telefono: { contains: busqueda, mode: 'insensitive' } }
        ]
      } : {},
      include: {
        _count: {
          select: { ventas: true }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: clientes
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// POST: Crear nuevo cliente
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar que el NIT no exista
    const existe = await prisma.cliente.findUnique({
      where: { nit: body.nit }
    })

    if (existe) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un cliente con ese NIT' },
        { status: 400 }
      )
    }

    const cliente = await prisma.cliente.create({
      data: {
        nit: body.nit,
        nombre: body.nombre,
        telefono: body.telefono,
        email: body.email,
        direccion: body.direccion,
        tipoPrecio: body.tipoPrecio || 'DETAL'
      }
    })

    return NextResponse.json({
      success: true,
      data: cliente
    }, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
