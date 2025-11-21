import { prisma } from '../../../lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const stock = await prisma.stock.findMany({
      include: {
        producto: {
          include: {
            seccion: true
          }
        },
        bodega: true
      }
    })

    return NextResponse.json({
      success: true,
      data: stock
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
