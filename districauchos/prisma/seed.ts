import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Cargando datos iniciales en Neon...')

  // Crear secciones
  const cauchos = await prisma.seccion.upsert({
    where: { codigo: 'CAU' },
    update: {},
    create: {
      codigo: 'CAU',
      nombre: 'Cauchos'
    }
  })

  const soportes = await prisma.seccion.upsert({
    where: { codigo: 'SOP' },
    update: {},
    create: {
      codigo: 'SOP',
      nombre: 'Soportes de Motor'
    }
  })

  const rines = await prisma.seccion.upsert({
    where: { codigo: 'RIN' },
    update: {},
    create: {
      codigo: 'RIN',
      nombre: 'Rines'
    }
  })

  console.log('✅ Secciones creadas:', { cauchos: cauchos.nombre, soportes: soportes.nombre, rines: rines.nombre })

  // Crear bodega principal
  const bodega = await prisma.bodega.upsert({
    where: { nombre: 'Principal' },
    update: {},
    create: {
      nombre: 'Principal'
    }
  })

  console.log('✅ Bodega creada:', bodega.nombre)

  // Crear plan de cuentas básico (PUC Colombia simplificado)
  const cuentas = [
    { codigo: '1105', nombre: 'Caja', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 2, padre: '11' },
    { codigo: '1305', nombre: 'Clientes', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 2, padre: '13' },
    { codigo: '1435', nombre: 'Inventarios', tipo: 'ACTIVO', naturaleza: 'DEBITO', nivel: 2, padre: '14' },
    { codigo: '2205', nombre: 'Proveedores', tipo: 'PASIVO', naturaleza: 'CREDITO', nivel: 2, padre: '22' },
    { codigo: '2408', nombre: 'IVA por Pagar', tipo: 'PASIVO', naturaleza: 'CREDITO', nivel: 2, padre: '24' },
    { codigo: '4135', nombre: 'Comercio al por Menor', tipo: 'INGRESO', naturaleza: 'CREDITO', nivel: 2, padre: '41' },
    { codigo: '6135', nombre: 'Costo de Ventas', tipo: 'GASTO', naturaleza: 'DEBITO', nivel: 2, padre: '61' },
  ]

  for (const cuenta of cuentas) {
    await prisma.planCuentas.upsert({
      where: { codigo: cuenta.codigo },
      update: {},
      create: cuenta
    })
  }

  console.log('✅ Plan de cuentas creado: 7 cuentas')

  // Cliente genérico para ventas rápidas
  const cliente = await prisma.cliente.upsert({
    where: { nit: '222222222' },
    update: {},
    create: {
      nit: '222222222',
      nombre: 'Cliente Genérico',
      tipoPrecio: 'DETAL'
    }
  })

  console.log('✅ Cliente genérico creado:', cliente.nombre)

  // Proveedor de ejemplo
  const proveedor = await prisma.proveedor.upsert({
    where: { nit: '900123456' },
    update: {},
    create: {
      nit: '900123456',
      nombre: 'Distribuidora de Cauchos S.A.',
      contacto: 'Juan Pérez',
      telefono: '3001234567',
      email: 'ventas@distribuidora.com'
    }
  })

  console.log('✅ Proveedor creado:', proveedor.nombre)

  // Crear algunos productos de ejemplo
  const producto1 = await prisma.producto.create({
    data: {
      sku: 'CAU-GOOD-TBL-195/65R15-00001',
      nombre: 'Llanta Goodyear Excellence 195/65 R15',
      seccionId: cauchos.id,
      marca: 'GOODYEAR',
      medida: '195/65R15',
      compatibilidad: 'Sedan compacto, Civic, Corolla',
      costoPromedio: 280000,
      precioBase: 380000,
      iva: 19,
      minStock: 4
    }
  })

  const producto2 = await prisma.producto.create({
    data: {
      sku: 'SOP-CHAS-DER-Corolla-1.8-10/15-00001',
      nombre: 'Soporte Motor Derecho Toyota Corolla 1.8 2010-2015',
      seccionId: soportes.id,
      marca: 'CHASIS',
      medida: 'Corolla-1.8-10/15',
      compatibilidad: 'Toyota Corolla 1.8L 2010-2015',
      costoPromedio: 85000,
      precioBase: 135000,
      iva: 19,
      minStock: 3
    }
  })

  const producto3 = await prisma.producto.create({
    data: {
      sku: 'CAU-MICH-PRM-205/55R16-00002',
      nombre: 'Llanta Michelin Primacy 205/55 R16',
      seccionId: cauchos.id,
      marca: 'MICHELIN',
      medida: '205/55R16',
      compatibilidad: 'Mazda 3, Mazda 6, Honda Accord',
      costoPromedio: 320000,
      precioBase: 450000,
      iva: 19,
      minStock: 4
    }
  })

  const producto4 = await prisma.producto.create({
    data: {
      sku: 'RIN-ALUM-16-5H-114-00001',
      nombre: 'Rin Aluminio 16" 5 Huecos 114mm',
      seccionId: rines.id,
      marca: 'UNIVERSAL',
      medida: '16x7',
      compatibilidad: 'Honda, Mazda, Toyota, Nissan',
      costoPromedio: 180000,
      precioBase: 280000,
      iva: 19,
      minStock: 2
    }
  })

  const producto5 = await prisma.producto.create({
    data: {
      sku: 'CAU-BRID-TURA-185/60R14-00003',
      nombre: 'Llanta Bridgestone Turanza 185/60 R14',
      seccionId: cauchos.id,
      marca: 'BRIDGESTONE',
      medida: '185/60R14',
      compatibilidad: 'Chevrolet Spark, Kia Picanto',
      costoPromedio: 210000,
      precioBase: 295000,
      iva: 19,
      minStock: 6
    }
  })

  const producto6 = await prisma.producto.create({
    data: {
      sku: 'SOP-CHAS-IZQ-Civic-2.0-16/20-00002',
      nombre: 'Soporte Motor Izquierdo Honda Civic 2.0 2016-2020',
      seccionId: soportes.id,
      marca: 'CHASIS',
      medida: 'Civic-2.0-16/20',
      compatibilidad: 'Honda Civic 2.0L 2016-2020',
      costoPromedio: 95000,
      precioBase: 155000,
      iva: 19,
      minStock: 3
    }
  })

  const producto7 = await prisma.producto.create({
    data: {
      sku: 'CAU-YOKO-S80-225/45R17-00004',
      nombre: 'Llanta Yokohama S.drive 225/45 R17',
      seccionId: cauchos.id,
      marca: 'YOKOHAMA',
      medida: '225/45R17',
      compatibilidad: 'Mazda 3, Civic Si, Golf GTI',
      costoPromedio: 380000,
      precioBase: 520000,
      iva: 19,
      minStock: 4
    }
  })

  const producto8 = await prisma.producto.create({
    data: {
      sku: 'RIN-ACER-17-5H-112-00002',
      nombre: 'Rin Acero 17" 5 Huecos 112mm',
      seccionId: rines.id,
      marca: 'UNIVERSAL',
      medida: '17x7.5',
      compatibilidad: 'Volkswagen, Audi, Seat',
      costoPromedio: 150000,
      precioBase: 240000,
      iva: 19,
      minStock: 2
    }
  })

  const producto9 = await prisma.producto.create({
    data: {
      sku: 'SOP-CHAS-TRANS-Mazda3-2.0-14/18-00003',
      nombre: 'Soporte Transmisión Mazda 3 2.0 2014-2018',
      seccionId: soportes.id,
      marca: 'CHASIS',
      medida: 'Mazda3-2.0-14/18',
      compatibilidad: 'Mazda 3 2.0L 2014-2018',
      costoPromedio: 72000,
      precioBase: 118000,
      iva: 19,
      minStock: 3
    }
  })

  const producto10 = await prisma.producto.create({
    data: {
      sku: 'CAU-HANK-VEN-195/55R16-00005',
      nombre: 'Llanta Hankook Ventus 195/55 R16',
      seccionId: cauchos.id,
      marca: 'HANKOOK',
      medida: '195/55R16',
      compatibilidad: 'Hyundai Elantra, Kia Cerato',
      costoPromedio: 265000,
      precioBase: 365000,
      iva: 19,
      minStock: 5
    }
  })

  console.log('✅ Productos de ejemplo creados')

  // Agregar stock inicial
  await prisma.stock.createMany({
    data: [
      { productoId: producto1.id, bodegaId: bodega.id, cantidad: 10 },
      { productoId: producto2.id, bodegaId: bodega.id, cantidad: 5 },
      { productoId: producto3.id, bodegaId: bodega.id, cantidad: 8 },
      { productoId: producto4.id, bodegaId: bodega.id, cantidad: 6 },
      { productoId: producto5.id, bodegaId: bodega.id, cantidad: 12 },
      { productoId: producto6.id, bodegaId: bodega.id, cantidad: 4 },
      { productoId: producto7.id, bodegaId: bodega.id, cantidad: 7 },
      { productoId: producto8.id, bodegaId: bodega.id, cantidad: 5 },
      { productoId: producto9.id, bodegaId: bodega.id, cantidad: 6 },
      { productoId: producto10.id, bodegaId: bodega.id, cantidad: 9 }
    ]
  })

  console.log('✅ Stock inicial agregado')

  console.log('\n🎉 ¡Base de datos lista para usar!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
