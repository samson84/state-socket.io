const { createStore, OutdatedUpdate } = require('./store')

function createIdGenertor(ids) {
  let index = 0
  return () => {
    return ids[index++]
  }
}

describe('stateHandler', () => {
  describe('create', () => {
    it('should create an instance with the proper interface', () => {
      const handler = createStore()

      expect(handler).toBeDefined()
      expect(handler.get).toBeInstanceOf(Function)
      expect(handler.update).toBeInstanceOf(Function)
      expect(handler.cleanup).toBeInstanceOf(Function)
    })
  }),
  describe('get', () => {
    it('should return null state if no state updated before. ', () => {
      const inputRoom = 'room1'
      const expected = {
        state: null,
        updateId: null
      }

      const handler = createStore()
      const current = handler.get(inputRoom)
      
      expect(current).toEqual(expected)
    })
    it('should get the initial state', () => {
      const initialState = {key1: 'value1'}
      const inputRoom = 'room1'
      const expected = {
        state: {key1: 'value1'},
        updateId: 'uuid1'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = createStore({idGenerator: mockIdGenerator})
      handler.update(inputRoom, null, initialState)
      const current = handler.get(inputRoom)

      expect(current).toEqual(expected)
    })
    it('should get the updated state', () => {
      const initialState = {key1: 'value1'}
      const inputRoom = 'room1'
      const inputNewState = {key2: 'value2'}
      const inputUpdateId = 'uuid1'
      const expected = {
        state: {key2: 'value2'},
        updateId: 'uuid2'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = createStore({idGenerator: mockIdGenerator})
      handler.update(inputRoom, null, initialState)
      handler.update(inputRoom, inputUpdateId, inputNewState)
      const current = handler.get(inputRoom)

      expect(current).toEqual(expected)
    })
    it('should not mutate the original state', () => {
      const initialState = {key1: 'value1'}
      const inputRoom = 'room1'
      const expected = {
        state: {key1: 'value1'},
        updateId: 'uuid1'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = createStore({idGenerator: mockIdGenerator})
      handler.update(inputRoom, null, initialState)
      let given = handler.get(inputRoom)
      given['state']['key1'] = 'mutataed'
      const current = handler.get(inputRoom)

      expect(current).toEqual(expected)
    })
  })
  describe('update', () => {
    it('should do a first update.', () => {
      const inputRoom = 'room1'
      const inputNewState = {key1: 'value1'}
      const inputUpdateId = null
      const expected = {
        state: {key1: 'value1'},
        updateId: 'uuid1'
      }

      const mockIdGenerator = createIdGenertor(['uuid1'])
      const handler = createStore({idGenerator: mockIdGenerator})
      const current = handler.update(inputRoom, inputUpdateId, inputNewState)

      expect(current).toEqual(expected)
    })
    it('should do a second update.', () => {
      const initialState = {key1: 'value1'}
      const inputRoom = 'room1'
      const inputNewState = {key2: 'value2'}
      const inputUpdateId = 'uuid1'
      const expected = {
        state: {key2: 'value2'},
        updateId: 'uuid2'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = createStore({idGenerator: mockIdGenerator})
      handler.update(inputRoom, null, initialState)
      const current = handler.update(inputRoom, inputUpdateId, inputNewState)

      expect(current).toEqual(expected)
    })
    it('should throw if the updateId is not equal to the latest', () => {
      const initialState = {key1: 'value1'}
      const inputRoom = 'room1'
      const inputNewState = {key2: 'value2'}
      const inputUpdateId = 'wrongId'
      const expected = OutdatedUpdate

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = createStore({idGenerator: mockIdGenerator})
      handler.update(inputRoom, null, initialState)
      const current = () => (
        handler.update(inputRoom, inputUpdateId, inputNewState)
      )

      expect(current).toThrow(expected)
    })
    it('should udpate with null as an updateId if no idGenerator given', () => {
      const initialState = {key1: 'value1'}
      const inputRoom = 'room1'
      const inputNewState = {key2: 'value2'}
      const inputUpdateId = null
      const expected = {
        state: {key2: 'value2'},
        updateId: null
      }

      const handler = createStore()
      handler.update(inputRoom, null, initialState)
      const current = handler.update(inputRoom, inputUpdateId, inputNewState)

      expect(current).toEqual(expected)
    })
  }),
  describe('cleanup', () => {
    it('should cleanup an existing room', () => {
      const inputRoom = 'room1'
      const inputNewState = {key1: 'value1'}
      const inputUpdateId = null
      const expected = {
        state: null,
        updateId: null
      }

      const mockIdGenerator = createIdGenertor(['uuid1'])
      const handler = createStore({idGenerator: mockIdGenerator})
      handler.update(inputRoom, inputUpdateId, inputNewState)
      handler.cleanup(inputRoom)
      const current = handler.get(inputRoom)

      expect(current).toEqual(expected)
    })
    it('should cleanup an non existing room too', () => {
      const inputRoom = 'nonExistingRoom'
      const expected = {
        state: null,
        updateId: null
      }
      const handler = createStore()
      handler.cleanup(inputRoom)
      const current = handler.get(inputRoom)

      expect(current).toEqual(expected)
    })
  })
  describe('multiple rooms', () => {
    it('should update multiple rooms properly', () => {
      const initialRoom1State = {room1Key1: 'room1value1'}
      const inputRoom1 = 'room1'
      const inputRoom1NewState = {room1key2: 'room1value2'}
      const inputUpdateRoom1Id = 'uuid1'

      const initialRoom2State = {room2Key1: 'room2value1'}
      const inputRoom2 = 'room2'
      const inputRoom2NewState = {room2key2: 'room2value2'}      
      const inputUpdateRoom2Id = 'uuid3'

      const expectedRoom1 = {
        state: {room1key2: 'room1value2'},
        updateId: 'uuid2'
      }
      const expectedRoom2 = {
        state: {room2key2: 'room2value2'},
        updateId: 'uuid4'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2', 'uuid3', 'uuid4'])
      const handler = createStore({idGenerator: mockIdGenerator})
      
      handler.update(inputRoom1, null, initialRoom1State)
      const currentRoom1 = handler.update(inputRoom1, inputUpdateRoom1Id, inputRoom1NewState)
      
      handler.update(inputRoom2, null, initialRoom2State)
      const currentRoom2 = handler.update(inputRoom2, inputUpdateRoom2Id, inputRoom2NewState)


      expect(currentRoom1).toEqual(expectedRoom1)
      expect(currentRoom2).toEqual(expectedRoom2)
    })
  })

})