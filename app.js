const { log } = require('console')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const cryptoRandomString = require('crypto-random-string')

let rooms = {
}

app.get('/allRooms', (req, res) => {
	res.json(rooms)
})

app.get('/createRoom/:user', (req, res) => {
	const roomCode = cryptoRandomString({ length: 6, type: 'alphanumeric' })
	const user = req.params.user

	rooms[roomCode] = {
		users:[user],
		score: []
	}
	console.log(rooms)
	res.send(roomCode)
})

app.get('/joinRoom/:user/:roomCode', (req, res) => {
	const roomCode = req.params.roomCode
	let user = req.params.user

	if (!(roomCode in rooms)) {
		res.send('없는 방입니다.')
		return
	}

	if (rooms[roomCode]['users'].length > 1) {
		res.send('풀방입니다.')
		return
	}

	if (rooms[roomCode]['users'][0] === user) {
		user = user + '1'
	}

	rooms[roomCode]['users'].push(user)

	console.log(rooms)
	res.send(rooms[roomCode])
})

io.on('connection', (socket) => {
	socket.on('create', (roomCode) => {
		socket.join(roomCode)
	})
	socket.on('join', (roomCode) => {
		socket.join(roomCode)
		socket.to(roomCode).broadcast.emit('user_joined', rooms[roomCode])
	})

	socket.on('shoot',(data)=>{
		if(rooms[data.roomCode]['users'][0] === data.user){
			rooms[data.roomCode]['score'][0] === data.score
		}
		else{
			rooms[data.roomCode]['score'][1] === data.score
		}

		if(rooms[data.roomCode]['score'][0] && rooms[data.roomCode]['score'][1]){
			if(rooms[data.roomCode]['score'][0] > rooms[data.roomCode]['score'][1]){
				socket.to(data.roomCode).emit('result',rooms[data.roomCode]['users'][0])
			}
			if(rooms[data.roomCode]['score'][0] < rooms[data.roomCode]['score'][1]){
				socket.to(data.roomCode).emit('result',rooms[data.roomCode]['users'][1])
			}
			else{
				socket.to(data.roomCode).emit('result','비김')
			}
		}
	})

})

app.listen(3000, () => {
	console.log('Server Running...')
})
