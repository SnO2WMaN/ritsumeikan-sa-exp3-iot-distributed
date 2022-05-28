import { connect as amqpConnect } from "amqp";

import { bold, green, red } from "std/fmt/colors";
import { parse } from "std/flags";

const parsedArgs = parse(Deno.args);

const edgeId = parsedArgs.id;
const rabbitmqUrl = parsedArgs.rabbitmqUrl;

if (!edgeId || typeof edgeId !== "string") {
  console.error(
    `${bold(red("Error:"))} missing edge id by ${bold("--id")}`,
  );
  Deno.exit(1);
}
if (!rabbitmqUrl || typeof rabbitmqUrl !== "string") {
  console.error(
    `${bold(red("Error:"))} missing rabbitmq url id by ${bold("--rabbitmqUrl")}`,
  );
  Deno.exit(1);
}

const amqp = await amqpConnect(rabbitmqUrl);
const amqpChan = await amqp.openChannel();
const amqpQueue = await amqpChan.declareQueue({
  queue: "pressure",
  durable: true,
});

console.log(bold(green("Start!")));
console.log(`Edge ID: ${green(edgeId)}`);
console.log(`Rabbitmq URL: ${green(rabbitmqUrl)}`);

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
