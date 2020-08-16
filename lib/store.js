const isFunction = require('lodash/isFunction')
const has = require('lodash/has')
const cloneDeep = require('lodash/cloneDeep')

class OutdatedUpdate extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor);
  }
}

function createStore({ idGenerator } = {}) {
  let _states = {}

  function _updateRoom(room, updateId, state) {
    _states[room] = {updateId, state}
  }

  function get(room) {
    if (!has(_states, room)) {
      _updateRoom(room, null, null)
    }
    return cloneDeep(_states[room])
  }
  function update(room, updateId, newState) {
    const latestUpdateId = get(room).updateId
    if (latestUpdateId !== updateId) {
      throw new OutdatedUpdate(`The current updateId (${updateId}) is not equal to the latest (${latestUpdateId}).`)
    }
    const nextUpdateId = isFunction(idGenerator) ? idGenerator() : null
    _updateRoom(room, nextUpdateId, cloneDeep(newState))
    return get(room)
  }

  function cleanup(room) {
    delete _states[room]
  }

  return { get, update, cleanup }
}

module.exports = { createStore, OutdatedUpdate }
