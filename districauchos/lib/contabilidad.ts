import { prisma } from './prisma'

// Plan de cuentas simplificado (PUC Colombia)
const CUENTAS = {
  CAJA: '1105',
  CUENTAS_POR_COBRAR: '1305',
  INVENTARIOS: '1435',
  PROVEEDORES: '2205',
  IVA_PAGADO: '2408',
  INGRESOS: '4135',
  COSTO_VENTAS: '6135'
}

interface AsientoDetalle {
  cuenta: string
  debe: number
  haber: number
  refDoc?: string
}

/**
 * Crear un asiento contable con sus detalles
 */
export async function crearAsiento(
  descripcion: string,
  tipo: 'VENTA' | 'COMPRA' | 'AJUSTE',
  detalles: AsientoDetalle[]
) {
  try {
    // Validar que esté cuadrado (debe = haber)
    const totalDebe = detalles.reduce((sum, d) => sum + d.debe, 0)
    const totalHaber = detalles.reduce((sum, d) => sum + d.haber, 0)

    if (Math.abs(totalDebe - totalHaber) > 0.01) {
      throw new Error(
        `Asiento descuadrado. Debe: ${totalDebe}, Haber: ${totalHaber}`
      )
    }

    // Crear asiento
    const asiento = await prisma.asiento.create({
      data: {
        fecha: new Date(),
        descripcion,
        tipo,
        detalles: {
          create: detalles.map(d => ({
            cuenta: d.cuenta,
            debe: d.debe,
            haber: d.haber,
            refDoc: d.refDoc
          }))
        }
      },
      include: {
        detalles: true
      }
    })

    return asiento
  } catch (error) {
    console.error('Error al crear asiento:', error)
    throw error
  }
}

/**
 * Registrar asiento contable por VENTA
 */
export async function registrarVentaContable(ventaId: string) {
  try {
    const venta = await prisma.venta.findUnique({
      where: { id: ventaId },
      include: {
        cliente: true,
        detalles: true
      }
    })

    if (!venta) {
      throw new Error('Venta no encontrada')
    }

    // Calcular costo total de venta
    let costoTotal = 0
    venta.detalles.forEach(detalle => {
      costoTotal += Number(detalle.costoUnit) * detalle.cantidad
    })

    const subtotal = Number(venta.subtotal)
    const ivaVenta = Number(venta.iva)

    // Asiento de venta:
    // DEBE: Caja (1105) o CxC (1305)
    // HABER: Ingresos (4135)
    // HABER: IVA por Pagar (2408)

    const detallesVenta: AsientoDetalle[] = [
      {
        cuenta: CUENTAS.CAJA, // O CUENTAS.CUENTAS_POR_COBRAR si es crédito
        debe: Number(venta.total),
        haber: 0,
        refDoc: ventaId
      },
      {
        cuenta: CUENTAS.INGRESOS,
        debe: 0,
        haber: subtotal,
        refDoc: ventaId
      },
      {
        cuenta: CUENTAS.IVA_PAGADO,
        debe: 0,
        haber: ivaVenta,
        refDoc: ventaId
      }
    ]

    // Crear asiento de ingresos
    const asientoIngresos = await crearAsiento(
      `Venta ${venta.consecutivo} - ${venta.cliente.nombre}`,
      'VENTA',
      detallesVenta
    )

    // Asiento de costo de ventas:
    // DEBE: Costo de Ventas (6135)
    // HABER: Inventarios (1435)

    const detallesCosto: AsientoDetalle[] = [
      {
        cuenta: CUENTAS.COSTO_VENTAS,
        debe: costoTotal,
        haber: 0,
        refDoc: ventaId
      },
      {
        cuenta: CUENTAS.INVENTARIOS,
        debe: 0,
        haber: costoTotal,
        refDoc: ventaId
      }
    ]

    // Crear asiento de costo
    await crearAsiento(
      `Costo de Venta ${venta.consecutivo}`,
      'VENTA',
      detallesCosto
    )

    // Actualizar la venta con el ID del asiento
    await prisma.venta.update({
      where: { id: ventaId },
      data: { asientoId: asientoIngresos.id }
    })

    console.log(`✅ Asientos contables registrados para venta ${venta.consecutivo}`)
    return asientoIngresos
  } catch (error) {
    console.error('Error al registrar venta contable:', error)
    throw error
  }
}

/**
 * Registrar asiento contable por COMPRA
 */
export async function registrarCompraContable(compraId: string) {
  try {
    const compra = await prisma.compra.findUnique({
      where: { id: compraId },
      include: {
        proveedor: true,
        detalles: true
      }
    })

    if (!compra) {
      throw new Error('Compra no encontrada')
    }

    const subtotal = Number(compra.subtotal)
    const ivaCompra = Number(compra.iva)
    const total = Number(compra.total)

    // Asiento de compra:
    // DEBE: Inventarios (1435)
    // DEBE: IVA Descontable (podríamos crear otra cuenta, pero usamos la misma por simplicidad)
    // HABER: Proveedores (2205)

    const detallesCompra: AsientoDetalle[] = [
      {
        cuenta: CUENTAS.INVENTARIOS,
        debe: subtotal,
        haber: 0,
        refDoc: compraId
      },
      {
        cuenta: CUENTAS.IVA_PAGADO,
        debe: ivaCompra,
        haber: 0,
        refDoc: compraId
      },
      {
        cuenta: CUENTAS.PROVEEDORES,
        debe: 0,
        haber: total,
        refDoc: compraId
      }
    ]

    const asiento = await crearAsiento(
      `Compra a ${compra.proveedor.nombre} - ${compra.consecutivo}`,
      'COMPRA',
      detallesCompra
    )

    await prisma.compra.update({
      where: { id: compraId },
      data: { asientoId: asiento.id }
    })

    console.log(`✅ Asientos contables registrados para compra ${compra.consecutivo}`)
    return asiento
  } catch (error) {
    console.error('Error al registrar compra contable:', error)
    throw error
  }
}

/**
 * Obtener balance general
 */
export async function obtenerBalanceGeneral() {
  try {
    const asientos = await prisma.asientoDetalle.findMany({
      include: {
        asiento: true
      }
    })

    const saldosCuentas: { [key: string]: { debe: number; haber: number } } = {}

    asientos.forEach(detalle => {
      if (!saldosCuentas[detalle.cuenta]) {
        saldosCuentas[detalle.cuenta] = { debe: 0, haber: 0 }
      }
      saldosCuentas[detalle.cuenta].debe += Number(detalle.debe)
      saldosCuentas[detalle.cuenta].haber += Number(detalle.haber)
    })

    return saldosCuentas
  } catch (error) {
    console.error('Error al obtener balance:', error)
    throw error
  }
}

/**
 * Obtener Estado de Resultados
 */
export async function obtenerEstadoResultados(desde: Date, hasta: Date) {
  try {
    const asientos = await prisma.asientoDetalle.findMany({
      where: {
        asiento: {
          fecha: {
            gte: desde,
            lte: hasta
          },
          tipo: 'VENTA'
        }
      },
      include: {
        asiento: true
      }
    })

    let ingresos = 0
    let ivaVentas = 0
    let costoVentas = 0

    asientos.forEach(detalle => {
      if (detalle.cuenta === CUENTAS.INGRESOS) {
        ingresos += Number(detalle.haber)
      }
      if (detalle.cuenta === CUENTAS.IVA_PAGADO) {
        ivaVentas += Number(detalle.haber)
      }
      if (detalle.cuenta === CUENTAS.COSTO_VENTAS) {
        costoVentas += Number(detalle.debe)
      }
    })

    const gananciasBrutas = ingresos - costoVentas
    const margenBruto = ingresos > 0 ? (gananciasBrutas / ingresos) * 100 : 0

    return {
      periodo: { desde, hasta },
      ingresos,
      costoVentas,
      gananciasBrutas,
      margenBruto: margenBruto.toFixed(2) + '%',
      ivaVentas
    }
  } catch (error) {
    console.error('Error al obtener estado de resultados:', error)
    throw error
  }
}

/**
 * Obtener Kardex de un producto
 */
export async function obtenerKardexProducto(productoId: string) {
  try {
    const movimientos = await prisma.movimiento.findMany({
      where: { productoId },
      include: {
        producto: true,
        bodega: true
      },
      orderBy: {
        fecha: 'asc'
      }
    })

    let saldoUnidades = 0
    let saldoCosto = 0
    const kardex: any[] = []

    movimientos.forEach(mov => {
      const costo = Number(mov.costoUnit)
      const cantidadAnterior = saldoUnidades
      const costoAnterior = saldoCosto

      if (mov.tipo === 'ENTRADA') {
        saldoUnidades += mov.cantidad
        saldoCosto += mov.cantidad * costo
      } else if (mov.tipo === 'SALIDA') {
        saldoUnidades -= mov.cantidad
        saldoCosto -= mov.cantidad * costo
      }

      kardex.push({
        fecha: mov.fecha,
        tipo: mov.tipo,
        cantidad: mov.cantidad,
        costoUnit: costo,
        cantidadAnterior,
        costoAnterior,
        cantidadSaldo: saldoUnidades,
        costoSaldo: saldoCosto,
        referencia: mov.refDoc
      })
    })

    return kardex
  } catch (error) {
    console.error('Error al obtener kardex:', error)
    throw error
  }
}
