import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CommandHandler } from "@nestjs/cqrs";
import { UserResponseMessages } from "ResponseMessages/user.response.messages";
import { TokenService } from "src/Common/Application/Output/TokenService";
import Result from "src/Common/Application/Result";
import { ConfirmVerificationEmailCommand } from "src/User/Application/Commands/ConfirmVerificationEmailCommand";
import { UserRepository } from "src/User/Application/Ports/Output/UserRepository";
import { ConfirmVerificationEmail } from "src/User/Application/UseCases/ConfirmVerificationEmail";
import UserId from "src/User/Domain/UserId";



@CommandHandler(ConfirmVerificationEmailCommand)
export class ConfirmVerificationEmailImpl implements ConfirmVerificationEmail {

    constructor(@Inject(TokenService) private readonly tokenService: TokenService, @Inject(UserRepository) private readonly userRepository: UserRepository) { }

    async execute(command: ConfirmVerificationEmailCommand): Promise<Result<void>> {



        const verifyResult = await this.tokenService.verify(command.token)


        if ("failure" in verifyResult) {
            return { failure: verifyResult.failure }
        }


        let { userId, email, name, ip } = JSON.parse(verifyResult.ok)


        const UserId2 = UserId.fromValid(userId)

        const user = await this.userRepository.load(UserId2)


        if (user.isNull()) {
            return { failure: new NotFoundException(UserResponseMessages.USER_NOT_AUTHENTICATED) }
        }

        user.confirmEmail()

        await this.userRepository.save(user)

        return { ok: undefined }

    }



}