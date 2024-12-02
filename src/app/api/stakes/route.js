const ElectrumClient = require('electrum-client')
import { parseStakeResponse } from './parse'

export async function GET() {
  const clientPort = process.env.ELECTRS_PORT
  const clientHost = process.env.ELECTRS_HOST
  const protocol = 'tcp'

  const client = new ElectrumClient(clientPort, clientHost, protocol)

  try {
    await client.connect()
    const response = await client.request('vault.transactions.subscribe', [
      1,
      null,
    ])
    await client.close()

    const returnData = response ? parseStakeResponse(response) : []

    return Response.json({ data: returnData })
  } catch (error) {
    console.error('Electrum client error:', error)
    return Response.json({ error: 'Failed to fetch stakes' }, { status: 500 })
  }
}
