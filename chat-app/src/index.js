const express = require('express')
const path = require('path')
const http = require('http')
const Filter = require('bad-words')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New web socket connection.')

    // Join a room
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options})
        if(error) return callback(error)
        socket.join(user.room)
        // Welcome message
        socket.emit('message', generateMessage('Admin', 'Welcome to my chatroom.'))
        // Broadcast user entry
        socket.broadcast.to(user.room).emit('message', generateMessage( 'Admin', `${user.username} has joined the room.`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    // Send message to particular user
    socket.on('sendMessage', (message, callback) =>{
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)) return callback('Profanity is not allowed.')

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    // Send location to chatroom
    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${ location.latitude },${ location.longitude }`))
        callback()
    })

    // Disconnect user message
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        } 
    })

})

server.listen(port, () => {
    console.log('Server is up on port: ', port)
})