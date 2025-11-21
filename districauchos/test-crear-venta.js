// test-crear-venta.js
const fetch = require('node-fetch') // Necesitas instalar: npm install node-fetch@2

async function test() {
  try {
    console.log('🧪 Iniciando prueba de venta...\n')

    // 1. Obtener clientes
    console.log('1️⃣ Obteniendo clientes...')
    const clientesRes = await fetch('http://localhost:3000/api/clientes')
    const clientes = await clientesRes.json()
    
    if (!clientes.data || clientes.data.length === 0) {
      console.error('❌ No hay clientes en la base de datos')
      return
    }
    const cliente = clientes.data[0]
    console.log(`✅ Cliente: ${cliente.nombre} (${cliente.nit})`)

    // 2. Obtener productos
    console.log('\n2️⃣ Obteniendo productos...')
    const productosRes = await fetch('http://localhost:3000/api/productos')
    const productos = await productosRes.json()
    
    if (!productos.data || productos.data.length === 0) {
      console.error('❌ No hay productos en la base de datos')
      return
    }
    const producto = productos.data[0]
    console.log(`✅ Producto: ${producto.nombre}`)
    console.log(`   Precio: $${Number(producto.precioBase).toLocaleString('es-CO')}`)

    // 3. Crear venta
    console.log('\n3️⃣ Creando venta...')
    const ventaRes = await fetch('http://localhost:3000/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clienteId: cliente.id,
        items: [{
          productoId: producto.id,
          cantidad: 2,
          precioUnit: Number(producto.precioBase),
          iva: Number(producto.iva),
          costoUnit: Number(producto.costoPromedio)
        }],
        metodoPago: 'EFECTIVO',
        descuento: 0
      })
    })

    const venta = await ventaRes.json()

    if (!venta.success) {
      console.error('❌ Error al crear venta:', venta.error)
      return
    }

    console.log(`✅ Venta creada: ${venta.data.consecutivo}`)
    console.log(`   Total: $${Number(venta.data.total).toLocaleString('es-CO')}`)
    console.log(`\n📄 Descargar factura PDF:`)
    console.log(`   http://localhost:3000/api/ventas/${venta.data.id}/pdf`)
    console.log('\n🎉 Prueba completada exitosamente!')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n💡 Asegúrate de que el servidor esté corriendo con: npm run dev')
  }
}

test()
