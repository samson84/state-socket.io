const isFunction = require('lodash/isFunction');
const {createStore, OutdatedUpdate} = require('./store');

function sendAck(payload, ack) {
  if (isFunction(ack)) {
    ack(null, payload)
  }
}

function sendErrorAck(error, ack) {
  if (isFunction(ack)) {
    ack(error, null)
  }
}

const ERRORS = {
  OUTDATED_UPDATE: 'outdated_update',
  INTERNAL_SERVER_ERROR: 'internal_server_error'
}

const basicLogger = {
  error: console.error,
  warning: console.log,
  info: console.log,
  debug: console.log
}

function createStateMiddleware(
  {
    logger = basicLogger, 
  } = {}
) {
  const EVENTS = {
    NOTIFY: 'notify',
    UPDATE: 'update',
    GET: 'get'
  }

  const store = createStore()

  logger.info('[state-socket.io] Created.')

  return function middleware(socket, next) { 
    socket.on(EVENTS.UPDATE, (params, ack) => {
      const { updateId, newState} = params
      logger.debug(`[state-socket.io][${socket.id}] update called with params: ${JSON.stringify(params)}`)
      try {
        const updatedState = store.update(updateId, newState)
        sendAck(updatedState, ack)
        socket.broadcast.emit(EVENTS.NOTIFY, updatedState)
        socket.emit(EVENTS.NOTIFY, updatedState)
        logger.info(`[state-socket.io][${socket.id}] State updated: ${JSON.stringify(updatedState)}`)
      } catch (error) {
        logger.error(`[state-socket.io][${socket.id}] Detected error during state update:`, error)
        const errorType = (error instanceof OutdatedUpdate)
          ? ERRORS.OUTDATED_UPDATE
          : ERRORS.INTERNAL_SERVER_ERROR
        sendErrorAck(errorType, ack)
      }
    })

    socket.on(EVENTS.GET, (ack) => {
      logger.debug(`[state-socket.io][${socket.id}] Getting a state`)
      const state = store.get()
      sendAck(state, ack)
      socket.emit(EVENTS.NOTIFY, state)
      logger.info(`[state-socket.io][${socket.id}] State emitted: ${JSON.stringify(state)}`)
    })
    next()
  }
}

module.exports = createStateMiddleware
