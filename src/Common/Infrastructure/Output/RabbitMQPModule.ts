import { AmqpConnection, RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Module, OnModuleInit } from '@nestjs/common';
import { Publisher } from 'src/Common/Application/Output/Publisher';
import { RabbitMQPublisher } from 'src/Common/Infrastructure/Output/RabbitMQPublisher';



@Module({
    imports: [

        RabbitMQModule.forRootAsync(RabbitMQModule, {
            useFactory: () => (


                {

                    exchanges: [{
                        name: "User",
                        type: "topic"

                    }],
                    uri: process.env.RABBITMQ_URL || "",
                    connectionInitOptions: { wait: false }
                }),

        }),
    ],
    providers: [
        {
            provide: Publisher,
            useClass: RabbitMQPublisher
        },
    ],
    exports: [
        {
            provide: Publisher,
            useClass: RabbitMQPublisher
        },
    ]
})

export class RabbitMQModuleImpl { }