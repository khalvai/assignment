import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CommandHandler } from '@nestjs/cqrs'
import { UserResponseMessages } from 'ResponseMessages/user.response.messages'
import { TokenService } from 'src/Common/Application/Output/TokenService'
import Result from 'src/Common/Application/Result'
import { InValidOperationException } from 'src/Common/Domain/Exceptions/InValidOperationException'
import NotValidInputException from 'src/Common/Domain/Exceptions/NotValidInput'
import { ConfirmVerificationEmailCommand } from 'src/User/Application/Commands/ConfirmVerificationEmailCommand'
import { UserRepository } from 'src/User/Application/Ports/Output/UserRepository'
import { ConfirmVerificationEmail } from 'src/User/Application/UseCases/ConfirmVerificationEmail'
import UserId from 'src/User/Domain/UserId'

@CommandHandler(ConfirmVerificationEmailCommand)
export class ConfirmVerificationEmailImpl implements ConfirmVerificationEmail {
	constructor(
		@Inject(TokenService) private readonly tokenService: TokenService,
		@Inject(UserRepository) private readonly userRepository: UserRepository
	) {}

	async execute(command: ConfirmVerificationEmailCommand): Promise<void> {
		const verifyResult = await this.tokenService.verify(command.token)

		if ('failure' in verifyResult) {
			throw new NotValidInputException([UserResponseMessages.INVALID_CREDENTIALS])
		}

		let { userId, email, name, ip } = JSON.parse(verifyResult.ok)

		const UserId2 = UserId.fromValid(userId)

		const user = await this.userRepository.load(UserId2)

		if (user.isNull()) {
			new InValidOperationException(UserResponseMessages.USER_NOT_AUTHENTICATED)
		}

		user.confirmEmail()

		await this.userRepository.save(user)

		return
	}
}
