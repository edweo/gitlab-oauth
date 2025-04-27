export default function initPort (): number {
  if (process.env.NODE_ENV === 'test') {
    return 3000
  }

  const port: number = Number(process.env.PORT)
  if (Number.isNaN(port)) {
    console.log('ERROR: Missing \'PORT\' declaration in the .env file.')
    process.exit()
  }
  return port
}
