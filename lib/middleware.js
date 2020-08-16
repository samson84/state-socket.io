const isFunction = require('lodash/isFunction');
const createStore = require('./store').create

function sendAck(payload, ack) {
  if (isFunction(ack)) {
    ack(payload)
  }
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
    NOTIFY_GROUP: 'notifyGroup',
    JOIN_TO_GROUP: 'joinToGroup',
    UPDATE_STATE: 'udpateState',
    GET_STATE: 'getState'
  }  
  const store = createStore()
  return function middleware(socket, next) { 
    socket.on(EVENTS.JOIN_TO_GROUP, ({groupId}, ack) => {
      logger.debug(`[${socket.id}] Socket is joining to the group: [${groupId}].`)
      socket.join(groupId, (error) => {
        if (error) {
          logger.error(`[${socket.id}] Error during joining to a group: [${groupId}]. ${error}`)
          return sendAck(error)
        }
        logger.info(`[${socket.id}] Socket joined to group ${groupId}.`)
        logger.debug(`[${socket.id}] Client\'s current rooms: `, Object.keys(socket.rooms))
        const currentState = store.get(groupId)
        sendAck(currentState, ack)
        logger.debug(`[${socket.id}] State sent: ${JSON.stringify(currentState)}`)  
      })
    })
  
    socket.on(EVENTS.UPDATE_STATE, (params, ack) => {
      const { groupId, updateId,  newState} = params
      logger.debug(`[${socket.id}] updateState called with params: ${JSON.stringify(params)}`)
      try {
        const stateToSend = store.update(groupId, updateId, newState)
        sendAck(stateToSend, ack)        
        socket.to(groupId).emit(EVENTS.NOTIFY_GROUP, currentState)  
        logger.info(`[${socket.id}][${groupId}] Group is updated with state: ${JSON.stringify(currentState)}`)
      } catch (e) {
        logger.error(`[${socket.id}] Detected error during state update:`, e)
        sendAck(error, ack)
      }
    })  
    socket.on(EVENTS.GET_STATE, ({ groupId }, ack) => {
      logger.info(`[${socket.id}] Getting a state.s`)
      const stateToSend = store.get(groupId)
      sendAck(stateToSend, ack)
    })
    next()
  }
}

module.exports = createStateMiddleware
