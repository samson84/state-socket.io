const { createStore, OutdatedUpdate } = require('./store')

function createIdGenertor(ids) {
  let index = 0
  return () => {
    return ids[index++]
  }
}

describe('createStore', () => {
  describe('create', () => {
    it('should create an instance with the proper interface', () => {
      const handler = createStore()

      expect(handler).toBeDefined()
      expect(handler.get).toBeInstanceOf(Function)
      expect(handler.update).toBeInstanceOf(Function)
    })
  }),
  describe('get', () => {
    it('should return null state if no state updated before. ', () => {
      const expected = {
        state: null,
        updateId: 'uuid1'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = createStore({idGenerator: mockIdGenerator})
      const current = handler.get()
      
      expect(current).toEqual(expected)
    })
    it('should get the initial state', () => {
      const initialState = {key1: 'value1'}
      const updateId = 'uuid1'
      const expected = {
        state: {key1: 'value1'},
        updateId: 'uuid2'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = createStore({idGenerator: mockIdGenerator})
      handler.update(updateId, initialState)
      const current = handler.get()

      expect(current).toEqual(expected)
    })
    it('should get the updated state', () => {
      const initialState = {key1: 'value1'}
      const inputNewState = {key2: 'value2'}
      const inputUpdateId1 = 'uuid1'
      const inputUpdateId2 = 'uuid2'
      const expected = {
        state: {key2: 'value2'},
        updateId: 'uuid3'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2', 'uuid3'])
      const handler = createStore({idGenerator: mockIdGenerator})
      handler.update(inputUpdateId1, initialState)
      handler.update(inputUpdateId2, inputNewState)
      const current = handler.get()

      expect(current).toEqual(expected)
    })
    it('should not mutate the original state', () => {
      const initialState = {key1: 'value1'}
      const updateId = 'uuid1'
      const expected = {
        state: {key1: 'value1'},
        updateId: 'uuid2'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = createStore({idGenerator: mockIdGenerator})
      handler.update(updateId, initialState)
      let given = handler.get()
      given['state']['key1'] = 'mutataed'
      const current = handler.get()

      expect(current).toEqual(expected)
    })
  })
  describe('update', () => {
    it('should do a first update.', () => {
      const inputNewState = {key1: 'value1'}
      const inputUpdateId = 'uuid1'
      const expected = {
        state: {key1: 'value1'},
        updateId: 'uuid2'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = createStore({idGenerator: mockIdGenerator})
      const current = handler.update(inputUpdateId, inputNewState)

      expect(current).toEqual(expected)
    })
    it('should do a second update.', () => {
      const initialState = {key1: 'value1'}
      const inputNewState = {key2: 'value2'}
      const inputUpdateId1 = 'uuid1'
      const inputUpdateId2 = 'uuid2'
      const expected = {
        state: {key2: 'value2'},
        updateId: 'uuid3'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2', 'uuid3'])
      const handler = createStore({idGenerator: mockIdGenerator})
      handler.update(inputUpdateId1, initialState)
      const current = handler.update(inputUpdateId2, inputNewState)

      expect(current).toEqual(expected)
    })
    it('should throw if the updateId is not equal to the latest', () => {
      const initialState = {key1: 'value1'}
      const inputNewState = {key2: 'value2'}
      const inputUpdateId = 'uuid1'
      const inputUpdateIdWrong = 'wrongId'
      const expected = OutdatedUpdate

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = createStore({idGenerator: mockIdGenerator})
      handler.update(inputUpdateId, initialState)
      const current = () => (
        handler.update(inputUpdateIdWrong, inputNewState)
      )

      expect(current).toThrow(expected)
    })
  })
})
