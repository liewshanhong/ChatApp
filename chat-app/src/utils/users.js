const users = []

// Add a user
const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validating data
    if(!username || !room) return { error: 'Username and room are required.' }

    // Check for existing user
    const exist = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if(exist) return { error: 'Username is taken.' }

    // Store user
    const user = { id, username, room}
    users.push(user)

    return { user }
}

// Remove a user
const removeUser = (id) => {
    const idx = users.findIndex((user) => user.id === id)
    if(idx !== -1) return users.splice(idx, 1)[0]
}

// Get a user
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

// Get users in a room
const getUsersInRoom = (room) => {
    return users.filter((user) =>  user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}