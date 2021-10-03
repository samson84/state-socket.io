# state-socket.io

A simple state syncing middleware for Socket.io. 

## The problem it solves

In most cases you don't need a complex server side logic, just a simple service
that syncronize the app's states between the clients. This middleware does exactly
the same. It is great for client heavy applications, where the client handles the business logic.

* The clients can update the state, by emitting an `update` event.
* Any client can get the current state, by emitting a `get` event.
* Any client can subscribe to the `notify` event, where the updates from the other clients are sent.
* The middleware handle the out of date sync, when the client not updating the latest state.

## Status of the package

Package is under development, it hasn't been ready for public usage yet. It is open for development, but some tests, guidelines and automated piplines are missing.

## Getting started

### Peer Dependencies

* `socket-io`: 4.x

### Install package

`npm i state-socket.io socket-io`

### Creating a server

Simply use the `createStateMiddleware()` function as a socket.io middleware.

```js
// server.js

const { createServer } = require('http')
const { Server } = require('socket.io')
const { createStateMiddleware } = require('state-scoket.io')

const httpServer = createServer()
const io = new Server(httpServer, { path: '/socket.io/' })
io.use(createStateMiddleware())

io.on("connection", (socket) => {
  console.log("[socket.io] Connected.")
});

SERVER_PORT=3000
httpServer.listen(SERVER_PORT, () => {
  console.log(`[http server] started on http://localhost:${SERVER_PORT}`)
});

```

### Using in a client

The following events can be emitted:

* `scoket.emit('get', callback`): 
  * Get the current state.
  * The `callback` is called, with error first syntax: `(error, data) => {}`
  * Response `data` in the callback `{updateId: '<some random id>', state: {}}`
  * The initial state is `null`.
* `socket.emit('update', params, callback)`
  * Updates the current state with a new one. It is not trigger a `notify` event for the current client just for the others.
  * `params`:
    * `updateId`: The server needs the latest update ID, to avoid state overrides from other clients. 
      * If the client do not send the latest update id, it will result an error. 
      * The latest update ID can be consumed from the `notify` event or from the `get` and `update` callbacks.
    * `newState`: The new state. It van be any data, typically an object. You need the previous state, if you want to change that.
  * `callback`: `(error, data) => {}`
    * Error first syntax.
    * Response `data` in the callback `{updateId: '<some random id>', state: {}}`

```js
const socket = io({ transports: ['websocket'] })
socket.on('connect', () => {
  // the client needs the latest update ID to update the current state.
  let = updateId

  // getting the current state
  socket.emit('get', (error, data) => {
    console.log(`updateId`: data.updateId, `current state`: data.state)
    updateId = data.updateId
  }

  // updating the state
  socket.emit(
    'update', 
    { updateId, newState: {someKey: 'value'} }, 
    (error, data) => {
      console.log(`updateId`: data.updateId, `current state`: data.state)
      updateId = data.updateId
    }
  )

  // get notification of the updates done by other clients
  socket.on('notify', (data) => {
    console.log(data)
    updateId = data.updateId
  })
}

```

### Error handling

The error variable in the callback is a string with a following values:

* `outdated_update`: not the latest `udpateId` is used. Get the new `udpateId` or retry the `udpate` event.
* `internal_server_error`: some unexpected error is happened in the middleware, check the server logs.

### Examples

Check the example subdir for a basic working example [A basic example](./example)

If you check out the repo, you can run the example with:

`npm i && npm run example`

Then naviagte to the URL provided by the console.

## Roadmap

v1.0.0 - 1st public release
* [x] Basic functionality (update, get, notify)
* [ ] Integration tests through socket.io
* [x] Working unit tests
* [x] working examples
* [ ] check compatbility w namespaces, add an example too
* [ ] nicer examples
* [x] documentation (usage)
* [ ] create test pipeline
* [ ] contribution / development docs

next
* [ ] Typescript
* [ ] more sophisitcated update handling
* [ ] Abstract the store adapter
* [ ] room support
* [ ] remove data if nobody in the room
* [ ] Update history, rollback
* [ ] Inroduce Typescript
* [ ] Remove data based on timestamp
* [ ] support custom event names
* [ ] Add a working server out of the box
  * [ ] with configurable namespaces
