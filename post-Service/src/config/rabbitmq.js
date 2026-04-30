import amqp from "amqplib"
import logger from "../utils/logger.js"

let connection=null;
let channel=null;

const EXCHANGE_NAME="facebook_events"

export async function connectRabbitMQ(){
    try{
        connection=await amqp.connect(process.env.RABBITMQ_URL)
        channel=await connection.createChannel()

        await channel.assertExchange(EXCHANGE_NAME,"topic",{durable:false})
        logger.info("connected to RabbitMQ");
        return channel
    }catch (e) {
        console.error("RabbitMQ connection failed:", e);
        logger.error(`Error connecting to rabbit mq: ${e.message}`);
        throw e;
    }
}
export async function publishEvent(routingKey, message) {
    if (!channel) {
      await connectRabbitMQ();
    }
  
    channel.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(message))
    );
    logger.info(`Event published: ${routingKey}`);
  }

export async function closeRabbitMQ() {
    try {
      if (channel) await channel.close();
      if (connection) await connection.close();
  
      logger.info("RabbitMQ connection closed gracefully");
    } catch (err) {
      logger.error("Error closing RabbitMQ", err);
    }
  }
