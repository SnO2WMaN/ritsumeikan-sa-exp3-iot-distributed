import { connect as amqpConnect } from "amqp";
import { MongoClient } from "mongo";
import { parse } from "std/flags";
import { bold, green, red } from "std/fmt/colors";

const parsedArgs = parse(Deno.args);

const rabbitmqUrl = parsedArgs.rabbitmqUrl;
const mongoUrl = parsedArgs.mongoUrl;

if (!rabbitmqUrl || typeof rabbitmqUrl !== "string") {
  console.error(
    `${bold(red("Error:"))} missing rabbitmq url by ${bold("--rabbitmqUrl")}`,
  );
  Deno.exit(1);
}

if (!mongoUrl || typeof mongoUrl !== "string") {
  console.error(
    `${bold(red("Error:"))} missing mongo url by ${bold("--mongoUrl")}`,
  );
  Deno.exit(1);
}

const amqp = await amqpConnect(rabbitmqUrl);
const amqpChan = await amqp.openChannel();
const amqpQueue = await amqpChan.declareQueue({
  queue: "pressure",
  durable: true,
});

const mongo = new MongoClient();
await mongo.connect(mongoUrl);
const coll = await mongo.database().collection("pressure");

await amqpChan.consume(
  { queue: amqpQueue.queue },
  async function (args, props, data) {
    const {
      edge,
      timestamp,
      pressure,
      floor,
    } = JSON.parse(new TextDecoder().decode(data));
    await coll.insertOne({
      timestamp: new Date(timestamp),
      edge,
      pressure,
      floor,
    });
    await amqpChan.ack({ deliveryTag: args.deliveryTag });
  },
);

console.log(bold(green("Start!")));
console.log(`RabbitMQ URL: ${green(rabbitmqUrl)}`);
console.log(`MongoDB URL: ${green(mongoUrl)}`);
