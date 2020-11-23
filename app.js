const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const cryptoRandomString = require('crypto-random-string')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let rooms = {
	test:{
		length: '2',
		asdf:{
			type: undefined,
			click: 0	
		}
	}
}

app.get('/allRooms', (req, res) => {
	res.json(rooms)
})

app.post('/createRoom', (req, res) => {
	const roomCode = cryptoRandomString({ length: 6, type: 'alphanumeric' })
	const user = req.body.user
	const length = req.body.length

	rooms[roomCode] = {}
	rooms[roomCode]['length'] = parseInt(length)
	rooms[roomCode][user] = {
		type: undefined,
		click: 0	
	}
	
	console.log(rooms)
	res.send(roomCode)
})

app.post('/joinRoom/', (req, res) => {
	const roomCode = req.body.roomCode
	let user = req.body.user

	if (!(roomCode in rooms)) {
		res.send('없는 방입니다.')
		return
	}

	if (Object.keys(rooms[roomCode]).length > rooms[roomCode].length) {
		res.send('풀방입니다.')
		return
	}

	if (user in rooms[roomCode]) {
		res.send('이미 있는 닉네임입니다.')
		return
	}

	rooms[roomCode][user] = {
		type: undefined,
		click: 0
	}

	console.log(rooms)
	res.send(rooms[roomCode])
})

io.on('connection', (socket) => {
	socket.on('create', (roomCode) => {
		socket.join(roomCode)
	})
	socket.on('join', (roomCode) => {
		socket.join(roomCode)
		socket.broadcast.to(roomCode).emit('user_joined', rooms[roomCode])
	})

	socket.on('chat',(data)=>{
		io.to(data.roomCode).emit('chat message', `${data.user} : ${data.message}`)
	})

})

server.listen(3000,()=>{
	console.log('Server Running...')
})
