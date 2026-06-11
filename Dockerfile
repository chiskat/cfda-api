FROM chiskat/baseline-node24-alpine:2026.6.8

ARG NPM_REGISTRY=https://registry.npmjs.org

EXPOSE 9000
WORKDIR /cfda-api

ENV NODE_ENV=production

COPY .docker-deps /cfda-api
RUN --mount=type=cache,id=pnpm,target=/paperplane-next/.pnpm-store pnpm i --frozen-lockfile --store-dir /cfda-api/.pnpm-store --registry=$NPM_REGISTRY

COPY . /cfda-api/
RUN pnpm run build

CMD [ "pnpm", "run", "prod" ]