const SerialPort = require('serialport')
const shuffleArray = require('./utils/shuffleArray')
const Player = require('./Player')

const ERROR_GROUP = 'error'

module.exports = class Main {
	constructor() {
		this.portPath = null
		this.cardGroups = 3
		this.cardsPerGroup = 2
		this.attachedCard = null
		this.releaseCardAfter = 500
		this.releaseCardAfterTimeout = null
		this.cards = {}
		this.unallocatedMusicReferences = []
		this.player = null
	}

	setPortPath(portPath) {
		this.portPath = portPath
	}

	start() {
		if (!this.portPath) {
			throw new Error('Port not set.')
		}

		this.player = new Player(this.cardGroups)

		this._shuffleMusic()

		this._connectToArduino()
	}

	_shuffleMusic() {
		this.unallocatedMusicReferences = shuffleArray(
			new Array(this.cardGroups * this.cardsPerGroup).fill(0).map((_, i) => {
				return i % this.cardGroups
			})
		)
	}

	_connectToArduino() {
		const port = new SerialPort(this.portPath)

		port.on('error', error => {
			console.log('Error: ', error.message)
		})

		let waitingForLength = true
		let nextIdLength = 1
		port.on('readable', () => {
			let chunk
			while (
				null !== (chunk = port.read(waitingForLength ? 1 : nextIdLength))
			) {
				if (waitingForLength) {
					nextIdLength = chunk[0]
				} else {
					this._processCard(chunk.toString('base64'))
				}
				waitingForLength = !waitingForLength
			}
		})
	}

	_processCard(id) {
		if (id !== this.attachedCard) {
			this._cardAttached(id)
		}

		clearTimeout(this.releaseCardAfterTimeout)
		this.releaseCardAfterTimeout = setTimeout(() => {
			this._cardReleased()
		}, this.releaseCardAfter)
	}

	_cardAttached(id) {
		if (this.attachedCard !== null) {
			this._cardReleased()
		}
		console.log('Card attached', id)

		this.attachedCard = id

		if (!this.cards[id]) {
			this._createCard(id)
		}

		this._playCard(id)
	}

	_cardReleased() {
		this.attachedCard = null
		this.player.stop()
		console.log('Card released')
	}

	_createCard(id) {
		console.log('Creating card', id)
		let group
		if (this.unallocatedMusicReferences.length === 0) {
			console.error('Too many cards')
			group = ERROR_GROUP
		} else {
			group = this.unallocatedMusicReferences.pop()
		}
		this.cards[id] = {
			group,
		}
	}

	_playCard(id) {
		const { group } = this.cards[id]
		if (group === ERROR_GROUP) {
			this.player.error()
		} else {
			this.player.start(group)
		}
	}
}
