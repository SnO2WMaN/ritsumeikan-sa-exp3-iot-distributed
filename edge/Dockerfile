FROM denoland/deno:latest

WORKDIR /app

COPY import_map.json ./import_map.json
COPY *.ts ./

RUN deno cache --import-map=./import_map.json ./mod.ts

CMD ["run","--import-map=./import_map.json", "--allow-net","--allow-env=EDGE_ID,RABBITMQ_URL","./mod.ts"]

# RUN deno cache --import-map=./import_map.json ./mod.ts
# CMD ["run","--import-map=./import_map.json", "--allow-net","--allow-env=EDGE_ID,RABBITMQ_URL","./mod.ts"]

# RUN deno compile \
#     --output ./edge \
#     --import-map=./import_map.json \
#     --allow-net --allow-env=EDGE_ID,RABBITMQ_URL \
#     ./mod.ts
# 
# FROM alpine AS runner
# 
# WORKDIR /app
# 
# COPY --from=builder /app/edge ./edge
# 
# RUN ls -la
# 
# ENTRYPOINT [ "./edge" ]