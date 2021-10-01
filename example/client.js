'use strict'

const textInput = ( {placeholder} ) => {
  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = placeholder
  return input  
}

const button = ( {text} ) => {
  const button = document.createElement('button')
  button.append(text)
  return button
}

const pre = ( {text} ) => {
  const pre = document.createElement('pre')
  pre.append(text)
  return pre
}

const li = ( {item} ) => {
  const li = document.createElement('li')
  li.append(item)
  return li
}

const ul = ( {items} ) => {
  const ul = document.createElement('ul')
  const children = items.map(item => li({item}))
  ul.append(...children)
  return ul
}

let nameList = ul({items: []})
const nameInput = textInput({placeholder: 'Your Name'})
const addNameButton = button({text: 'Add Name'})

const app = document.getElementById('app')
app.append(nameInput, addNameButton, nameList)

let updateId = null;
let state = null;

const socket = io({ transports: ['websocket'] })
socket.on('connect', () => {
  console.log(`[${socket.id}] Connected.`)
  socket.emit('get', (error, data) => {
    console.log('get response', error, data)
    if (!data.state) {
      socket.emit('update', {updateId: data.updateId, newState: {users: []}})
    }
    
  })
  socket.on('notify', (data) => {
    console.log('notify event', data)
    updateId = data.updateId
    state = data.state

    if (state) {
      const newNameList = ul( {items: [...state.users]} )
      app.replaceChild(newNameList, nameList)    
      nameList = newNameList  
    }
  })
  addNameButton.addEventListener('click', () => {
    const newUsers = [...state.users, nameInput.value]
    socket.emit(
      'update', 
      { updateId, newState: { users: newUsers } }, 
      (error, data) => {
        console.log('udpate response', error, data)
      }
    )
    nameInput.value = ''
  })
  
})

