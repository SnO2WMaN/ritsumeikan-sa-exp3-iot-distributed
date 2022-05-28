import { MongoClient } from "mongo";
import { Application, Router } from "oak";
import { parse } from "std/flags";
import { bold, green, red, yellow } from "std/fmt/colors";

const parsedArgs = parse(Deno.args);

const mongoUrl = parsedArgs.mongoUrl;
if (!mongoUrl || typeof mongoUrl !== "string") {
  console.error(
    `${bold(red("Error:"))} missing mongo url by ${bold("--mongoUrl")}`,
  );
  Deno.exit(1);
}

const mongo = new MongoClient();
await mongo.connect(mongoUrl);
const coll = await mongo.database().collection("pressure");

const app = new Application();
const router = new Router();

router.get("/result", async (context) => {
  const now = Date.now();
  const result = await coll.aggregate<
    {
      floor: number;
      graph: {
        avg: number;
        min: number;
        max: number;
        period: string;
        samples: number;
        edges: string[];
      }[];
    }
  >(
    [
      {
        $match: {
          timestamp: { $gte: new Date(now - 6 * 3.6e6), $lte: new Date(now) },
        },
      },
      {
        $group: {
          "_id": {
            floor: "$floor",
            period: {
              "$dateTrunc": { date: "$timestamp", unit: "minute", binSize: 5 },
            },
          },
          avg: { "$avg": "$pressure" },
          min: { "$min": "$pressure" },
          max: { "$max": "$pressure" },
          samples: { "$count": {} },
          edges: { $addToSet: "$edge" },
        },
      },
      { $sort: { "_id.period": -1 } },
      {
        $group: {
          _id: "$_id.floor",
          graph: {
            $push: {
              period: "$_id.period",
              samples: "$samples",
              min: "$min",
              max: "$max",
              avg: "$avg",
              edges: "$edges",
            },
          },
        },
      },
      { $project: { _id: 0, floor: "$_id", graph: 1 } },
      { $sort: { floor: 1 } },
    ],
  )
    .toArray();

  context.response.body = result;
});

app.use(router.routes());
app.use(router.allowedMethods());
app.addEventListener("listen", ({ hostname, port, serverType }) => {
  console.log(bold(`Start listening on: ${green(`${hostname}:${port}`)}`));
  console.log(bold(`using HTTP server: ${green(serverType)}`));
  console.log(bold(`using MongoDB: ${green(mongoUrl)}`));
});

await app.listen({
  port: (() => {
    const env = Deno.env.get("PORT");
    if (env) return parseInt(env, 10);
    else return 8000;
  })(),
});
console.log(bold("Finished."));
