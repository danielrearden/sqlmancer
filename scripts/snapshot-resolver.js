module.exports = {
  resolveSnapshotPath: (testPath) => testPath.replace('.test.ts', '.test.snap'),
  resolveTestPath: (snapshotFilePath) => snapshotFilePath.replace('.test.snap', '.test.ts'),
  testPathForConsistencyCheck: 'test/unit/example.test.js',
}
