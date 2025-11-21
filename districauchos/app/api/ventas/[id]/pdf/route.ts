import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { generarFacturaPDF } from '@/lib/pdf-generator'

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
            producto: true
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

    // Generar PDF
    const pdfDoc = await generarFacturaPDF(venta as any)

    // Usar getBase64 en lugar de getStream
    return new Promise<NextResponse>((resolve) => {
      pdfDoc.getBase64((data: string) => {
        const buffer = Buffer.from(data, 'base64')
        const response = new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="factura-${venta.consecutivo}.pdf"`,
            'Content-Length': buffer.length.toString()
          }
        })
        resolve(response)
      })
    })

  } catch (error) {
    console.error('Error al generar PDF:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al generar PDF' 
      },
      { status: 500 }
    )
  }
}
