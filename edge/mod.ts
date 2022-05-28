import { connect as amqpConnect } from "amqp";

import { bold, green, red } from "std/fmt/colors";
import { parse } from "std/flags";

const parsedArgs = parse(Deno.args);

const edgeId = parsedArgs.id;
const rabbitmqUrl = parsedArgs.rabbitmqUrl;
const params = parsedArgs.params;

if (!edgeId || typeof edgeId !== "string") {
  console.error(
    `${bold(red("Error:"))} missing edge id by ${bold("--id")}`,
  );
  Deno.exit(1);
}

if (!rabbitmqUrl || typeof rabbitmqUrl !== "string") {
  console.error(
    `${bold(red("Error:"))} missing rabbitmq url by ${bold("--rabbitmqUrl")}`,
  );
  Deno.exit(1);
}

if (!params || typeof params !== "string") {
  console.error(
    `${bold(red("Error:"))} missing params by ${bold("--params")}`,
  );
  Deno.exit(1);
}
const { min, max, floor } = JSON.parse(params);
if (!min || typeof min !== "number") {
  console.error(
    `${bold(red("Error:"))} cannot find params.min`,
  );
  Deno.exit(1);
}
if (!floor || typeof max !== "number") {
  console.error(
    `${bold(red("Error:"))} cannot find params.max`,
  );
  Deno.exit(1);
}
if (!floor || typeof floor !== "number") {
  console.error(
    `${bold(red("Error:"))} cannot find params.floor`,
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
console.log(`min: ${green(min.toString())}`);
console.log(`max: ${green(max.toString())}`);
console.log(`floor: ${green(floor.toString())}`);

setInterval(async () => {
  await amqpChan.publish(
    { routingKey: amqpQueue.queue },
    { contentType: "application/json" },
    new TextEncoder().encode(JSON.stringify(
      {
        edge: edgeId,
        timestamp: Date.now(),
        pressure: min + (max - min) * Math.random(),
        floor,
      },
    )),
  );
}, 1000);
