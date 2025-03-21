module.exports = {
  preset: 'ts-jest', // If you're using TypeScript
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: ['/node_modules/(?!(lit|@shoelace-style|flatpickr)/)'],
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['./jest.setup.cjs'],
  testEnvironment: 'jsdom',
};
