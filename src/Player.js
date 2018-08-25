const play = require('audio-play')
const load = require('audio-loader')
const path = require('path')
const fs = require('fs')
const shuffleArray = require('./utils/shuffleArray')

const SOUNDS_DIRECTORY = path.join(__dirname, 'sounds')
const MUSIC_DIRECTORY = path.join(__dirname, '..', 'music')

module.exports = class Player {
	constructor(soundsCount) {
		this.soundsCount = soundsCount
		this.playback = null
		this.files = []
		this.playing = false

		this._findAllMusic()
	}

	_findAllMusic() {
		this.files = shuffleArray(fs.readdirSync(MUSIC_DIRECTORY))
	}

	error() {
		load(path.join(SOUNDS_DIRECTORY, 'error.mp3')).then(play)
	}

	start(soundNumber) {
		this.playing = true
		if (soundNumber >= this.files.length) {
			console.error('Not enough music files to play.')
			this.error()
		} else {
			load(path.join(MUSIC_DIRECTORY, this.files[soundNumber])).then(buffer => {
				if (this.playing) {
					this.playback = play(buffer)
				}
			})
		}
	}

	stop() {
		if (this.playback) {
			this.playback.pause()
		}
		this.playing = false
	}
}
