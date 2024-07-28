import AlreadyExistsException from 'src/Common/Domain/Exceptions/AlreadyExistsException'
import NotValidInputException from 'src/Common/Domain/Exceptions/NotValidInput'
import { RegisterUseCaseImpl } from 'src/User/Application/Ports/Input/RegisterImpl'
import NullUser from 'src/User/Domain/NullUser'
import User from 'src/User/Domain/User'

describe('user register', () => {
	it('should give invalid input ', () => {
		const hashService = {
			createHash: jest.fn(),
			compare: jest.fn()
		}
		const userRepo = {
			load: async () => {
				return NullUser
			},
			loadByEmail: async () => {
				return NullUser
			},
			save: jest.fn()
		}
		const a = new RegisterUseCaseImpl(hashService, userRepo)

		expect(() =>
			a.execute({
				confirmPassword: 'ehsasnPassword',
				password: 'ehsasn',
				email: 'ehsan@gmail.com',
				ip: '127.1.1.1',
				name: 'ehsan'
			})
		).rejects.toThrow(NotValidInputException)
	})

	it('should give already exists user ', () => {
		const hashService = {
			createHash: jest.fn(),
			compare: jest.fn()
		}
		const userRepo = {
			load: async () => {
				return NullUser
			},
			loadByEmail: async () => {
				return new User()
			},
			save: jest.fn()
		}
		const a = new RegisterUseCaseImpl(hashService, userRepo)

		expect(() =>
			a.execute({
				confirmPassword: 'ehsasnPassword',
				password: 'ehsasnPassword',
				email: 'ehsan@gmail.com',
				ip: '127.1.1.1',
				name: 'ehsan'
			})
		).rejects.toThrow(AlreadyExistsException)
	})
})
