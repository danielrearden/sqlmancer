import { WritableMock } from 'stream-mock'
import { generateClientFromSchema } from '../generateClientFromSchema'
import { schema } from './__fixtures__/schema'

describe('buildClientFromSchema', () => {
  test('correct usage', async () => {
    const stream = new WritableMock()
    generateClientFromSchema(
      schema,
      { dialect: 'postgres', transformFieldNames: 'SNAKE_CASE', typeDefs: '', output: '' },
      stream
    )
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
