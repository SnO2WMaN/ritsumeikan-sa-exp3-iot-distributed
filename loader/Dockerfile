FROM denoland/deno:latest

WORKDIR /workdir

COPY import_map.json ./import_map.json
COPY *.ts ./

RUN deno cache --import-map=./import_map.json ./mod.ts

CMD ["run","--import-map=./import_map.json", "--allow-net","--allow-env=RABBITMQ_URL,MONGO_URL","./mod.ts"]