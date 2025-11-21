import { NextResponse } from 'next/server'
import { obtenerKardexProducto } from '@/lib/contabilidad'

export async function GET(
  request: Request,
  props: { params: Promise<{ productoId: string }> }
) {
  try {
    const params = await props.params
    const { productoId } = params

    const kardex = await obtenerKardexProducto(productoId)

    return NextResponse.json({
      success: true,
      data: kardex
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
