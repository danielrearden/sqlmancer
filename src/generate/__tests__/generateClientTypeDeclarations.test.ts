import { WritableMock } from 'stream-mock'
import { generateClientTypeDeclarations } from '../generateClientTypeDeclarations'
import { schema } from './__fixtures__/schema'

describe('generateClientTypeDeclarations', () => {
  test('correct usage', async () => {
    const stream = new WritableMock()
    generateClientTypeDeclarations(schema, stream)
    stream.end()
    await new Promise((resolve, reject) => {
      stream.on('finish', () => {
        expect((stream.flatData as Buffer).toString()).toMatchSnapshot()
        resolve()
      })
      stream.on('error', reject)
    })
  })
})
