import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import QRCode from 'qrcode'

// @ts-ignore
pdfMake.vfs = pdfFonts.pdfMake.vfs

interface ProductoDetalle {
  producto: {
    sku: string
    nombre: string
    medida: string | null
  }
  cantidad: number
  precioUnit: any
  ivaUnit: any
  subtotal: any
}

interface VentaData {
  consecutivo: string
  fecha: Date
  cliente: {
    nit: string
    nombre: string
    direccion: string | null
    telefono: string | null
  }
  detalles: ProductoDetalle[]
  subtotal: any
  iva: any
  descuento: any
  total: any
  metodoPago: string
}

export async function generarFacturaPDF(venta: VentaData) {
  // Generar código QR
  const qrDataUrl = await QRCode.toDataURL(
    `Factura: ${venta.consecutivo}\nTotal: $${Number(venta.total).toLocaleString('es-CO')}`,
    { width: 100 }
  )

  // Construir tabla de productos
  const tableBody: any[] = [
    [
      { text: 'SKU', style: 'tableHeader' },
      { text: 'Descripción', style: 'tableHeader' },
      { text: 'Cant.', style: 'tableHeader' },
      { text: 'Precio', style: 'tableHeader' },
      { text: 'IVA', style: 'tableHeader' },
      { text: 'Total', style: 'tableHeader' }
    ]
  ]

  venta.detalles.forEach(d => {
    const totalItem = Number(d.subtotal) + (Number(d.ivaUnit) * d.cantidad)
    tableBody.push([
      { text: d.producto.sku, fontSize: 8 },
      [
        { text: d.producto.nombre, fontSize: 9 },
        { text: d.producto.medida || '', fontSize: 7, color: '#666' }
      ],
      { text: d.cantidad.toString(), alignment: 'center' },
      { text: `$${Number(d.precioUnit).toLocaleString('es-CO')}`, alignment: 'right' },
      { text: `$${(Number(d.ivaUnit) * d.cantidad).toLocaleString('es-CO')}`, alignment: 'right', fontSize: 8 },
      { text: `$${totalItem.toLocaleString('es-CO')}`, alignment: 'right', bold: true }
    ])
  })

  // Tabla de totales
  const totalesBody: any[] = [
    [
      { text: 'Subtotal:', alignment: 'right' },
      { text: `$${Number(venta.subtotal).toLocaleString('es-CO')}`, alignment: 'right' }
    ],
    [
      { text: 'IVA:', alignment: 'right' },
      { text: `$${Number(venta.iva).toLocaleString('es-CO')}`, alignment: 'right' }
    ]
  ]

  if (Number(venta.descuento) > 0) {
    totalesBody.push([
      { text: 'Descuento:', alignment: 'right', color: '#e74c3c' },
      { text: `-$${Number(venta.descuento).toLocaleString('es-CO')}`, alignment: 'right', color: '#e74c3c' }
    ])
  }

  totalesBody.push([
    { text: 'TOTAL:', alignment: 'right', bold: true, fontSize: 12 },
    { text: `$${Number(venta.total).toLocaleString('es-CO')}`, alignment: 'right', bold: true, fontSize: 12 }
  ])

  const docDefinition: any = {
    pageSize: 'LETTER',
    pageMargins: [40, 60, 40, 60],

    header: {
      columns: [
        {
          stack: [
            { text: 'DISTRICAUCHOS DEL SUR', fontSize: 18, bold: true, color: '#2c3e50' },
            { text: 'NIT: 900.123.456-7', fontSize: 9, color: '#7f8c8d', margin: [0, 2, 0, 0] },
            { text: 'Cra 5 #10-25, Bogotá', fontSize: 9, color: '#7f8c8d', margin: [0, 2, 0, 0] },
            { text: 'Tel: (601) 555-1234', fontSize: 9, color: '#7f8c8d', margin: [0, 2, 0, 0] }
          ],
          margin: [40, 20, 0, 0]
        }
      ]
    },

    content: [
      {
        text: 'FACTURA DE VENTA',
        fontSize: 22,
        bold: true,
        alignment: 'center',
        color: '#3498db',
        margin: [0, 20, 0, 10]
      },

      {
        columns: [
          {
            stack: [
              { text: `No. ${venta.consecutivo}`, fontSize: 14, bold: true, color: '#2c3e50' },
              { 
                text: `Fecha: ${new Date(venta.fecha).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}`, 
                fontSize: 10,
                color: '#7f8c8d'
              },
              { text: `Pago: ${venta.metodoPago}`, fontSize: 10, color: '#7f8c8d', margin: [0, 5, 0, 0] }
            ],
            width: '*'
          },
          {
            image: qrDataUrl,
            width: 80,
            alignment: 'right'
          }
        ],
        margin: [0, 0, 0, 20]
      },

      { text: 'DATOS DEL CLIENTE', fontSize: 12, bold: true, color: '#3498db', decoration: 'underline', margin: [0, 10, 0, 5] },
      {
        table: {
          widths: [80, '*'],
          body: [
            [{ text: 'NIT:', bold: true }, venta.cliente.nit],
            [{ text: 'Nombre:', bold: true }, venta.cliente.nombre],
            [{ text: 'Dirección:', bold: true }, venta.cliente.direccion || 'N/A'],
            [{ text: 'Teléfono:', bold: true }, venta.cliente.telefono || 'N/A']
          ]
        },
        layout: 'noBorders',
        margin: [0, 5, 0, 20]
      },

      { text: 'DETALLE DE PRODUCTOS', fontSize: 12, bold: true, color: '#3498db', decoration: 'underline', margin: [0, 10, 0, 5] },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
          body: tableBody
        },
        layout: {
          hLineWidth: function (i: number, node: any) {
            return (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0
          },
          vLineWidth: function () { return 0 },
          hLineColor: function () { return '#cccccc' },
          paddingTop: function () { return 8 },
          paddingBottom: function () { return 8 }
        },
        margin: [0, 5, 0, 20]
      },

      {
        columns: [
          { text: '', width: '*' },
          {
            table: {
              widths: [100, 80],
              body: totalesBody
            },
            layout: 'lightHorizontalLines',
            width: 200
          }
        ]
      },

      {
        text: 'Términos y Condiciones:',
        fontSize: 8,
        italics: true,
        color: '#95a5a6',
        margin: [0, 30, 0, 5]
      },
      {
        text: '• Garantía: 30 días en productos sin uso.\n• Válida únicamente con esta factura.\n• No se aceptan devoluciones en productos usados.',
        fontSize: 8,
        italics: true,
        color: '#95a5a6'
      }
    ],

    styles: {
      tableHeader: {
        fillColor: '#3498db',
        color: 'white',
        bold: true,
        fontSize: 10,
        alignment: 'center'
      }
    },

    defaultStyle: {
      fontSize: 10
    }
  }

  return pdfMake.createPdf(docDefinition)
}
