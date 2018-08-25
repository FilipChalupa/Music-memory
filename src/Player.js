const path = require('path')
const fs = require('fs')
const shuffleArray = require('./utils/shuffleArray')
const spawn = require('child_process').spawn

const SOUNDS_DIRECTORY = path.join(__dirname, 'sounds')
const MUSIC_DIRECTORY = path.join(__dirname, '..', 'music')

module.exports = class Player {
	constructor(soundsCount) {
		this.soundsCount = soundsCount
		this.files = []
		this.playing = false
		this.vlc = null

		this._findAllMusic()
	}

	_findAllMusic() {
		this.files = shuffleArray(fs.readdirSync(MUSIC_DIRECTORY))
	}

	error() {
		this._play(path.join(SOUNDS_DIRECTORY, 'error.mp3'))
	}

	_play(filePath) {
		this.vlc = spawn('C:\\Program Files\\VideoLAN\\VLC\\vlc.exe', [filePath])
	}

	start(soundNumber) {
		if (soundNumber >= this.files.length) {
			console.error('Not enough music files to play.')
			this.error()
		} else {
			const filePath = path.join(MUSIC_DIRECTORY, this.files[soundNumber])
			this.stop()
			this.playing = true
			this._play(filePath)
		}
	}

	stop() {
		this.playing = false
		if (this.vlc) {
			this.vlc.kill()
			this.vlc = null
		}
	}
}
