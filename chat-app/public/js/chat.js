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

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(messageTemplatelocation, {
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
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
        if(error) return console.log(error)
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

socket.emit('join', { username, room })