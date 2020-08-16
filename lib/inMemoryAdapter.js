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

function create({ idGenerator } = {}) {
  let _states = {}

  function _updateGroup(group, updateId, state) {
    _states[group] = {updateId, state}
  }

  function get(group) {
    if (!has(_states, group)) {
      _updateGroup(group, null, null)
    }
    return cloneDeep(_states[group])
  }
  function update(group, updateId, newState) {
    const latestUpdateId = get(group).updateId
    if (latestUpdateId !== updateId) {
      throw new OutdatedUpdate(`The current updateId (${updateId}) is not equal to the latest (${latestUpdateId}).`)
    }
    const nextUpdateId = isFunction(idGenerator) ? idGenerator() : null
    _updateGroup(group, nextUpdateId, cloneDeep(newState))
    return get(group)
  }

  function cleanup(group) {
    delete _states[group]
  }

  return { get, update, cleanup }
}

module.exports = { create, OutdatedUpdate }
