const SerialPort = require('serialport')
const play = require('audio-play')
const load = require('audio-loader')
const path = require('path')
const fs = require('fs')

const MUSIC_DIRECTORY = path.join(__dirname, 'music')
const CARD_PAIRS_COUNT = 3

function shuffle(a) {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[a[i], a[j]] = [a[j], a[i]]
	}
	return a
}

console.log('Music memory')

let allSoundFiles = []
const cards = {}
let assignedCards = 0
let lastPlayedCard = ''

fs.readdir(MUSIC_DIRECTORY, function(error, files) {
	if (error) {
		return console.log('Unable to scan directory: ' + error)
	}
	allSoundFiles = shuffle(files)
	allSoundFiles = allSoundFiles.slice(0, CARD_PAIRS_COUNT)
	allSoundFiles = allSoundFiles.concat(allSoundFiles)
	allSoundFiles = shuffle(allSoundFiles)
	console.log('Available sounds:', files.join(', '))
})

const port = new SerialPort('COM5')
port.on('error', function(err) {
	console.log('Error: ', err.message)
})
port.on('data', function(data) {
	const uid = data.toString('base64')
	console.log(data, data[0] === 0)
	if (uid !== lastPlayedCard) {
		lastPlayedCard = uid
		console.log('Card detected:', uid)
		if (!cards[uid]) {
			console.log('Next sound assigned')
			cards[uid] = allSoundFiles[assignedCards % allSoundFiles.length]
			assignedCards++

			if (assignedCards >= CARD_PAIRS_COUNT * 2) {
				console.log('Too many cards!')
			}
		}
		const soundFile = cards[uid]
		console.log('Playing:', soundFile)
		console.log('')

		load(path.join(MUSIC_DIRECTORY, soundFile)).then(play)
	}
})
