const socket = io() 

// elements
const $messageForm = document.querySelector('#message-form')
const $input = $messageForm.querySelector('input')
const $button = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const messageTemplatelocation = document.querySelector('#message-template-location').innerHTML
const messageTemplatesidebar = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight
    
    // Height of container message
    const containerHeight = $messages.scrollHeight

    // Height of scroll
    const scrollHeight = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollHeight){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(messageTemplatelocation, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(messageTemplatesidebar, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disable
    $button.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        //enable
        $button.removeAttribute('disabled')
        $input.value = ''
        $input.focus()
        if(error) return alert(error)
        console.log('Message delivered.')
    })
})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation) return alert('Geolocation is not supported by your browser.')
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {

        const { latitude, longitude } = position.coords
        const data = {
            latitude,
            longitude
        }

        socket.emit('sendLocation', data, () => {
            $locationButton.removeAttribute('disabled')
            console.log('Location shared.')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    } 
} )