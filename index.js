const SerialPort = require('serialport')
const play = require('audio-play')
const load = require('audio-loader')
const path = require('path')
const fs = require('fs')

const MUSIC_DIRECTORY = path.join(__dirname, 'music')
const CARD_PAIRS_COUNT = 3
const PORT_PATH = 'COM5'
const REPLAY_AFTER = 5000

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
let lastPlayedCardTimeout

fs.readdir(MUSIC_DIRECTORY, function(error, files) {
	if (error) {
		return console.log('Unable to scan directory: ' + error)
	}
	allSoundFiles = shuffle(files)
	allSoundFiles = allSoundFiles.slice(0, CARD_PAIRS_COUNT)
	allSoundFiles = allSoundFiles.concat(allSoundFiles)
	allSoundFiles = shuffle(allSoundFiles)
	console.log('Available sounds:', files.join(', '))
	console.log('')
})

const port = new SerialPort(PORT_PATH)
port.on('error', function(err) {
	console.log('Error: ', err.message)
})

function processCard(uid) {
	if (uid !== lastPlayedCard) {
		console.log('Card detected:', uid)
		if (!cards[uid]) {
			console.log('Next sound assigned')
			cards[uid] = allSoundFiles[assignedCards % allSoundFiles.length]
			assignedCards++

			if (assignedCards > CARD_PAIRS_COUNT * 2) {
				console.log('Too many cards!')
			}
		}
		const soundFile = cards[uid]
		console.log('Playing:', soundFile)
		console.log('')

		load(path.join(MUSIC_DIRECTORY, soundFile)).then(play)

		lastPlayedCard = uid
		clearTimeout(lastPlayedCardTimeout)
		lastPlayedCardTimeout = setTimeout(() => {
			lastPlayedCard = ''
		}, REPLAY_AFTER)
	}
}

let waitingForLength = true
let nextIdLength = 1

port.on('readable', () => {
	let chunk
	while (null !== (chunk = port.read(waitingForLength ? 1 : nextIdLength))) {
		if (waitingForLength) {
			nextIdLength = chunk[0]
		} else {
			processCard(chunk.toString('base64'))
		}
		waitingForLength = !waitingForLength
	}
})
