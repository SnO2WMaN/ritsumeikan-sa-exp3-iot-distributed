FROM denoland/deno:1.22.1 AS builder

WORKDIR /app

COPY import_map.json ./import_map.json
COPY *.ts ./

RUN deno cache --import-map=./import_map.json ./mod.ts

RUN deno compile \
    --output ./edge \
    --import-map=./import_map.json \
    --allow-net --allow-env=PORT \
    ./mod.ts

FROM denoland/deno:distroless-1.22.1 AS runner

WORKDIR /app

COPY --from=builder /app/edge ./edge

ENTRYPOINT [ "./edge" ]