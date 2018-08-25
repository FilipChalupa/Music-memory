const Main = require('./src/Main')

console.log('Music memory')

const main = new Main()

main.setPortPath('COM5')

main.start()
