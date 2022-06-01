FROM node:16 AS builder

ARG vite_http_endpoint
ENV VITE_HTTP_ENDPOINT=$vite_http_endpoint

WORKDIR /app

# envsubst
RUN wget https://github.com/a8m/envsubst/releases/download/v1.2.0/envsubst-Linux-x86_64 -O envsubst && \
    chmod +x envsubst && \
    mv envsubst /bin

# pnpm
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

COPY pnpm-lock.yaml ./
RUN pnpm fetch

ADD .env.production.template ./
RUN envsubst < .env.production.template > .env.production

ADD package.json ./
RUN pnpm install -r --offline

ADD index.html \
    package.json \
    tsconfig.json \
    vite.config.ts \
    ./
ADD src ./src
RUN pnpm run build

FROM flashspys/nginx-static AS server
 
COPY --from=builder /app/dist /static