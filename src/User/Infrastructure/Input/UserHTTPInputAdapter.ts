import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Ip,
  Param,
  Post,
  UseFilters,
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { OnEvent } from "@nestjs/event-emitter";
import { Payload } from "@nestjs/microservices";
import { ApiTags } from "@nestjs/swagger";
import Result from "src/Common/Application/Result";
import { HttpExceptionFilter } from "src/Common/Infrastructure/Output/HttpExceptionFilter";
import { ConfirmVerificationEmailCommand } from "src/User/Application/Commands/ConfirmVerificationEmailCommand";
import { RegisterCommand } from "src/User/Application/Commands/RegisterCommand";
import { HttpRegisterCommand } from "src/User/Infrastructure/Input/Dto/HttpReginsterCommand";


@UseFilters(HttpExceptionFilter)
@ApiTags("Authentication")
@Controller("Auth")
export default class UserHTTPPInputAdapter {
  public constructor(private commandBus: CommandBus) { }



  @Post("/Register")
  public async registerNewUser(
    @Body() registerCommand: HttpRegisterCommand,
    @Ip() ip: string,
  ): Promise<void> {
    const result = await this.commandBus.execute<RegisterCommand, Result<void>>(
      new RegisterCommand(
        registerCommand.email,
        registerCommand.password,
        registerCommand.confirmPassword,
        registerCommand.name,
        ip,
      ),
    );

    if ("failure" in result) {
      throw result.failure;
    }
  }

  @Get("/:token")
  public async confirmVerificationEmail(@Param("token") token: string) {



    const result = await this.commandBus
      .execute<ConfirmVerificationEmailCommand, Result<void>>(new ConfirmVerificationEmailCommand(token))


    if ("failure" in result) {
      throw result.failure
    }
  }
  // @Post("/Login")
  // public async login(@Body() login: LoginCommand): Promise<LoginDto>
  // {
  //     return await this._loginInputPort.handle(login);
  // }
  // @Get("/VerifyEmailAddress/:emailVerificationToken")
  // public async verifyEmailAddress(@Param() emailVerificationToken: VerifyEmailAddressCommand): Promise<void>
  // {
  //     return this._verifyEmailAddressInputPort.handle(emailVerificationToken);
  // }
  // @Get("test")
  // public async test(): Promise<void>
  // {
  //     const token = await this._tokenService.signAndEncrypt(JSON.stringify({ name: "bahman" }), "AUTH", 5);

  //     console.log(token);
  // }
  //

}
