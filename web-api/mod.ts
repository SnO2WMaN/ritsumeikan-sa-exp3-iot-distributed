import { MongoClient } from "mongo";
import { Application, Router } from "oak";
import { oakCors } from "cors";
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
      period: string;
      edges: { edges: string[]; floor: number };
      plots: { floor: number; avg: number; min: number; max: number; period: string; samples: number }[];
    }
  >(
    [
      {
        $match: {
          timestamp: {
            $gte: new Date(now - 1000 * 60 * 60),
            $lte: new Date(now - 1000 * 30),
          },
        },
      },
      {
        $group: {
          _id: { floor: "$floor", period: { $dateTrunc: { date: "$timestamp", unit: "second", binSize: 10 } } },
          avg: { $avg: "$pressure" },
          min: { $min: "$pressure" },
          max: { $max: "$pressure" },
          samples: { $count: {} },
          edges: { $addToSet: "$edge" },
        },
      },
      { $sort: { "_id.floor": -1 } },
      {
        $group: {
          "_id": "$_id.period",
          "edges": { $push: { floor: "$_id.floor", edges: "$edges" } },
          "plots": { $push: { floor: "$_id.floor", min: "$min", max: "$max", avg: "$avg", samples: "$samples" } },
        },
      },
      { $project: { _id: 0, period: "$_id", edges: 1, plots: 1 } },
      { $sort: { period: 1 } },
    ],
  )
    .toArray();

  context.response.body = result;
});

app.use(oakCors());
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
