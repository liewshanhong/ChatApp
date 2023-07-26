const express = require('express')
const path = require('path')
const http = require('http')
const Filter = require('bad-words')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0
const welcome = 'Welcome to my chatroom!'

io.on('connection', (socket) => {
    console.log('New web socket connection.')

    socket.broadcast.emit('message', 'A new user has joined the chat.')

    socket.emit('message', welcome)

    socket.on('sendMessage', (message, callback) =>{
        const filter = new Filter()
        if(filter.isProfane(message)) return callback('Profanity is not allowed.')

        io.emit('message', message)
        callback('Delivered.')
    })

    socket.on('sendLocation', (location, callback) => {
        io.emit('message', `https://google.com/maps?q=${ location.latitude },${ location.longitude }`)
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left.')
    })

})

server.listen(port, () => {
    console.log('Server is up on port: ', port)
})