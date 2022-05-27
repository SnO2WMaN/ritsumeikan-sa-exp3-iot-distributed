import { connect as amqpConnect } from "amqp";
import { MongoClient } from "mongo";

const amqp = await amqpConnect(Deno.env.get("RABBITMQ_URL")!);
const amqpChan = await amqp.openChannel();
const amqpQueue = await amqpChan.declareQueue({
  queue: "pressure",
  durable: true,
});

const mongo = new MongoClient();
await mongo.connect(Deno.env.get("MONGO_URL")!);
const coll = await mongo.database().collection("pressure");

await amqpChan.consume(
  { queue: amqpQueue.queue },
  async function (args, props, data) {
    const {
      edge,
      timestamp,
      value,
    } = JSON.parse(new TextDecoder().decode(data));
    await coll.insertOne({
      timestamp: new Date(timestamp),
      edge,
      value,
    });
    await amqpChan.ack({ deliveryTag: args.deliveryTag });
    /*  await coll.insertOne({
      timestamp: new Date(parseInt($timestamp, 10)),
      value: parseFloat($value),
      location: {
        type: "Point",
        coordinates: [
          parseFloat($longitude),
          parseFloat($latitude),
        ],
      },
    });*/
  },
);
