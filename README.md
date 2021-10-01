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

v1.0.0 - 1st public release
* [x] Basic functionality (update, get, notify)
* [ ] Integration tests through socket.io
* [ ] Working unit tests
* [x] working examples
* [ ] rollup / packaging
* [ ] documentation (usage)
* [ ] contribution / development docs

next
* [ ] Abstract the store adapter
* [ ] room support
* [ ] remove data if nobody in the room
* [ ] Update history, rollback
* [ ] Inroduce Typescript
* [ ] Remove data based on timestamp
* [ ] support custom event names
* [ ] Add a working server out of the box
  * [ ] with configurable namespaces
