const SerialPort = require('serialport')
const port = new SerialPort('COM5')

console.log('Music memory')

port.on('error', function(err) {
	console.log('Error: ', err.message)
})

port.on('data', function(data) {
	console.log('Data:', data)
})
