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
  JOIN: 'join_error',
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
    NOTIFY_ROOM: 'notifyRoom',
    JOIN_TO_ROOM: 'joinToRoom',
    UPDATE_STATE: 'udpateState',
    GET_STATE: 'getState'
  }  
  const store = createStore()
  return function middleware(socket, next) { 
    socket.on(EVENTS.JOIN_TO_ROOM, ({roomId}, ack) => {
      logger.debug(`[${socket.id}] Socket is joining to the room: [${roomId}].`)
      socket.join(roomId, (error) => {
        if (error) {
          logger.error(`[${socket.id}] Error joining to a room: [${roomId}]. ${error}`)
          return sendErrorAck(ERRORS.JOIN, ack)
        }
        logger.info(`[${socket.id}] Socket joined to room ${roomId}.`)
        logger.debug(`[${socket.id}] Client\'s current rooms: `, Object.keys(socket.rooms))
        const currentState = store.get(roomId)
        sendAck(currentState, ack)
        logger.debug(`[${socket.id}] State sent: ${JSON.stringify(currentState)}`)  
      })
    })
  
    socket.on(EVENTS.UPDATE_STATE, (params, ack) => {
      const { roomId, updateId,  newState} = params
      logger.debug(`[${socket.id}] updateState called with params: ${JSON.stringify(params)}`)
      try {
        const stateToSend = store.update(roomId, updateId, newState)
        sendAck(stateToSend, ack)
        socket.to(roomId).emit(EVENTS.NOTIFY_ROOM, currentState)  
        logger.info(`[${socket.id}][${roomId}] Room is updated with state: ${JSON.stringify(currentState)}`)
      } catch (error) {
        logger.error(`[${socket.id}] Detected error during state update:`, error)
        const errorType = (error instanceof OutdatedUpdate)
          ? ERRORS.OUTDATED_UPDATE
          : ERRORS.INTERNAL_SERVER_ERROR
        sendErrorAck(errorType, ack)
      }
    })  
    socket.on(EVENTS.GET_STATE, ({ roomId }, ack) => {
      logger.info(`[${socket.id}] Getting a state`)
      const stateToSend = store.get(roomId)
      sendAck(stateToSend, ack)
    })
    next()
  }
}

module.exports = createStateMiddleware
