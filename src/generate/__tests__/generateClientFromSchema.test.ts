import { WritableMock } from 'stream-mock'
import { generateClientFromSchema } from '../generateClientFromSchema'
import { schema } from './__fixtures__/schema'

describe('generateClientFromSchema', () => {
  test('correct usage', async () => {
    const stream = new WritableMock()
    generateClientFromSchema(schema, stream)
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
