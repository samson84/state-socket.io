const { create, OutdatedUpdate } = require('./stateHandler')

function createIdGenertor(ids) {
  let index = 0
  return () => {
    return ids[index++]
  }
}

describe('stateHandler', () => {
  describe('create', () => {
    it('should create an instance with the proper interface', () => {
      const handler = create()

      expect(handler).toBeDefined()
      expect(handler.get).toBeInstanceOf(Function)
      expect(handler.update).toBeInstanceOf(Function)
      expect(handler.cleanup).toBeInstanceOf(Function)
    })
  }),
  describe('get', () => {
    it('should return null state if no state updated before. ', () => {
      const inputGroup = 'group1'
      const expected = {
        state: null,
        updateId: null
      }

      const handler = create()
      const current = handler.get(inputGroup)
      
      expect(current).toEqual(expected)
    })
    it('should get the initial state', () => {
      const initialState = {key1: 'value1'}
      const inputGroup = 'group1'
      const expected = {
        state: {key1: 'value1'},
        updateId: 'uuid1'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = create({idGenerator: mockIdGenerator})
      handler.update(inputGroup, null, initialState)
      const current = handler.get(inputGroup)

      expect(current).toEqual(expected)
    })
    it('should get the updated state', () => {
      const initialState = {key1: 'value1'}
      const inputGroup = 'group1'
      const inputNewState = {key2: 'value2'}
      const inputUpdateId = 'uuid1'
      const expected = {
        state: {key2: 'value2'},
        updateId: 'uuid2'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = create({idGenerator: mockIdGenerator})
      handler.update(inputGroup, null, initialState)
      handler.update(inputGroup, inputUpdateId, inputNewState)
      const current = handler.get(inputGroup)

      expect(current).toEqual(expected)
    })
    it('should not mutate the result the original state', () => {
      const initialState = {key1: 'value1'}
      const inputGroup = 'group1'
      const expected = {
        state: {key1: 'value1'},
        updateId: 'uuid1'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = create({idGenerator: mockIdGenerator})
      handler.update(inputGroup, null, initialState)
      let given = handler.get(inputGroup)
      given['state']['key1'] = 'mutataed'
      const current = handler.get(inputGroup)

      expect(current).toEqual(expected)
    })
  })
  describe('update', () => {
    it('should do a first update.', () => {
      const inputGroup = 'group1'
      const inputNewState = {key1: 'value1'}
      const inputUpdateId = null
      const expected = {
        state: {key1: 'value1'},
        updateId: 'uuid1'
      }

      const mockIdGenerator = createIdGenertor(['uuid1'])
      const handler = create({idGenerator: mockIdGenerator})
      const current = handler.update(inputGroup, inputUpdateId, inputNewState)

      expect(current).toEqual(expected)
    })
    it('should do a second update.', () => {
      const initialState = {key1: 'value1'}
      const inputGroup = 'group1'
      const inputNewState = {key2: 'value2'}
      const inputUpdateId = 'uuid1'
      const expected = {
        state: {key2: 'value2'},
        updateId: 'uuid2'
      }

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = create({idGenerator: mockIdGenerator})
      handler.update(inputGroup, null, initialState)
      const current = handler.update(inputGroup, inputUpdateId, inputNewState)

      expect(current).toEqual(expected)
    })
    it('should throw if the updateId is not equal to the latest', () => {
      const initialState = {key1: 'value1'}
      const inputGroup = 'group1'
      const inputNewState = {key2: 'value2'}
      const inputUpdateId = 'wrongId'
      const expected = OutdatedUpdate

      const mockIdGenerator = createIdGenertor(['uuid1', 'uuid2'])
      const handler = create({idGenerator: mockIdGenerator})
      handler.update(inputGroup, null, initialState)
      const current = () => (
        handler.update(inputGroup, inputUpdateId, inputNewState)
      )

      expect(current).toThrow(expected)
    })
    it('should udpate with null as an updateId if no idGenerator given', () => {
      const initialState = {key1: 'value1'}
      const inputGroup = 'group1'
      const inputNewState = {key2: 'value2'}
      const inputUpdateId = null
      const expected = {
        state: {key2: 'value2'},
        updateId: null
      }

      const handler = create()
      handler.update(inputGroup, null, initialState)
      const current = handler.update(inputGroup, inputUpdateId, inputNewState)

      expect(current).toEqual(expected)
    })
  }),
  describe('cleanup', () => {
    it('should cleanup an existing group', () => {
      const inputGroup = 'group1'
      const inputNewState = {key1: 'value1'}
      const inputUpdateId = null
      const expected = {
        state: null,
        updateId: null
      }

      const mockIdGenerator = createIdGenertor(['uuid1'])
      const handler = create({idGenerator: mockIdGenerator})
      handler.update(inputGroup, inputUpdateId, inputNewState)
      handler.cleanup(inputGroup)
      const current = handler.get(inputGroup)

      expect(current).toEqual(expected)
    })
    it('should cleanup an non existing group too', () => {
      const inputGroup = 'nonExistingGroup'
      const expected = {
        state: null,
        updateId: null
      }
      const handler = create()
      handler.cleanup(inputGroup)
      const current = handler.get(inputGroup)

      expect(current).toEqual(expected)
    })
  })

})