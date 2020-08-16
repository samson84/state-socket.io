# state-socket.io

A simple state syncing middleware for Socket.io. 

## The problem it solves

In most cases you don't need a complex server side logic, just a simple service
that syncronize the app's states between the clients. This middleware does exactly
the same.

* The clients can update the state, by emitting an `update state` event.
* Any client can get the current state, by emitting a `get state` event.
* Any client can subscribe to the `notify state` event, where the updates from the other clients are sent.
* The middleware handle the out of date sync, when the client not updating the latest state.

## Roadmap

Package is under development, it is not ready for public usage yet.

v1.0.0
* [ ] Basic functionality
* [ ] Integration tests through socket.io
* [ ] support custom event names

v1.1.0
* [ ] Abstract the store adapter
* [ ] Support multi threading / multi instance
