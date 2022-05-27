import { connect as amqpConnect } from "amqp";

import { bold, yellow } from "std/fmt/colors";

const edgeId = Deno.env.get("EDGE_ID")!;

const amqp = await amqpConnect(Deno.env.get("RABBITMQ_URL")!);
const amqpChan = await amqp.openChannel();
const amqpQueue = await amqpChan.declareQueue({
  queue: "pressure",
  durable: true,
});

console.log(bold("start"));
console.log(`edge:${yellow(edgeId)}`);

setInterval(async () => {
  await amqpChan.publish(
    { routingKey: amqpQueue.queue },
    { contentType: "application/json" },
    new TextEncoder().encode(JSON.stringify(
      {
        edge: edgeId,
        timestamp: Date.now(),
        value: 100 * Math.random(),
      },
    )),
  );
}, 1000);
