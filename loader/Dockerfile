FROM denoland/deno:latest

WORKDIR /workdir

COPY mod.ts ./mod.ts
COPY import_map.json ./import_map.json

CMD ["run","--import-map=./import_map.json", "--allow-net","--allow-env=RABBITMQ_URL,MONGO_URL","./mod.ts"]

# RUN deno compile \
#     --output ./edge \
#     --allow-net --allow-env=RABBITMQ_URL \
#     ./mod.ts

# FROM alpine AS runner
# 
# WORKDIR /workdir
# 
# COPY --from=builder /workdir/edge ./edge
# 
# ENTRYPOINT [""]
