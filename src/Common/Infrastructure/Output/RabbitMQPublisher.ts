import { AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Injectable } from "@nestjs/common";
import { Publisher } from "src/Common/Application/Output/Publisher";


@Injectable()
export class RabbitMQPublisher implements Publisher {

    constructor(private readonly amqpConnection: AmqpConnection) { }
    async publish(eventName: string, event: any): Promise<void> {


        if (eventName === "NewUserRegistered") {
        }

        try {

            await this.amqpConnection.publish("User", "NewUserRegistered", event)

        } catch (e) {
            console.log(e);

        }
    }


}