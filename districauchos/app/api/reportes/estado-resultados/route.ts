import { NextResponse } from 'next/server'
import { obtenerEstadoResultados } from '@/lib/contabilidad'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const desde = searchParams.get('desde')
    const hasta = searchParams.get('hasta')

    if (!desde || !hasta) {
      return NextResponse.json(
        { success: false, error: 'Se requieren parámetros "desde" y "hasta"' },
        { status: 400 }
      )
    }

    const resultados = await obtenerEstadoResultados(
      new Date(desde),
      new Date(hasta)
    )

    return NextResponse.json({
      success: true,
      data: resultados
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
