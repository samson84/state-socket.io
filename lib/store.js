const cloneDeep = require('lodash/cloneDeep')
const uuid = require('uuid');

class OutdatedUpdate extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor);
  }
}

function createStore({ idGenerator = uuid.v4 } = {}) {
  let _state = {updateId: idGenerator(), state: null}

  function get() {
    return cloneDeep(_state)
  }

  function update(updateId, newState) {
    if (_state.updateId !== updateId) {
      throw new OutdatedUpdate(`The current updateId (${updateId}) is not equal to the latest (${_state.updateId}).`)
    }
    _state = { updateId: idGenerator(), state: cloneDeep(newState) }
    return cloneDeep(_state)
  }

  return { get, update }
}

module.exports = { createStore, OutdatedUpdate }
