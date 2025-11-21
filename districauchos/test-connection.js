require('dotenv').config()

console.log('DATABASE_URL encontrada:', process.env.DATABASE_URL ? '✅ SÍ' : '❌ NO')
console.log('Valor:', process.env.DATABASE_URL)
