import { NextResponse } from 'next/server'
import { obtenerBalanceGeneral } from '@/lib/contabilidad'

export async function GET() {
  try {
    const balance = await obtenerBalanceGeneral()

    const cuentas = [
      { codigo: '1105', nombre: 'Caja' },
      { codigo: '1305', nombre: 'Cuentas por Cobrar' },
      { codigo: '1435', nombre: 'Inventarios' },
      { codigo: '2205', nombre: 'Proveedores' },
      { codigo: '2408', nombre: 'IVA por Pagar' },
      { codigo: '4135', nombre: 'Ingresos' },
      { codigo: '6135', nombre: 'Costo de Ventas' }
    ]

    const balanceFormato = cuentas.map(cuenta => {
      const saldo = balance[cuenta.codigo] || { debe: 0, haber: 0 }
      return {
        codigo: cuenta.codigo,
        nombre: cuenta.nombre,
        debe: Number(saldo.debe),
        haber: Number(saldo.haber),
        saldo: Number(saldo.debe) - Number(saldo.haber)
      }
    })

    return NextResponse.json({
      success: true,
      data: balanceFormato
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
