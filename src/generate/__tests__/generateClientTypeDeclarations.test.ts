import { BufferWritableMock } from 'stream-mock'
import { generateClientTypeDeclarations } from '../generateClientTypeDeclarations'
import { withDialects } from '../../__tests__/utilities'

describe('generateClientTypeDeclarations', () => {
  withDialects((_client, _rollback, schema) => {
    test('correct usage', async () => {
      const stream = new BufferWritableMock()
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
})
