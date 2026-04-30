import amqp from "amqplib"
import logger from "../utils/logger.js"

let connection = null;
let channel = null;

const EXCHANGE_NAME = "facebook_events"

export async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL)
    channel = await connection.createChannel()

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false })
    logger.info("connected to RabbitMQ");
    return channel
  } catch (e) {
    console.error("RabbitMQ connection failed:", e);
    logger.error(`Error connecting to rabbit mq: ${e.message}`);
    throw e;
  }
}
export async function consumeEvent(routingKey, callback) {
  if (!channel) {
    await connectRabbitMQ();
  }
  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
  channel.consume(q.queue, async (msg) => {
    if (!msg) return;
    try {
      const content = JSON.parse(msg.content.toString());
      await callback(content);
      channel.ack(msg);
    } catch (err) {
      logger.error(`❌ Error handling event ${routingKey}`, {
        message: err.message,
        stack: err.stack,
      });
      channel.ack(msg);
    }
  });

  logger.info(`📡 Subscribed to event: ${routingKey}`);
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
