# syntax=docker/dockerfile:1
# The demo admin app, served on http://localhost:4173
#
# Build contexts (see ../docker-compose.yml):
#   main context: this directory (nextgraph-admin-app)
#   ngrepo:       the local ./nextgraph-rs checkout, for the @ng-org/* SDK
#                 packages that package.json links to.
# Standalone build:
#   docker build -f docker/Dockerfile --build-context ngrepo=../nextgraph-rs .

# Not node:22-alpine: on musl, rolldown (vite's bundler) has no native binding
# and falls back to its wasm32 one, slower and capped at 4 GB of memory, which
# big bundles have exceeded ("WebAssembly.Memory.grow(): Maximum memory size
# exceeded").
FROM node:22-slim AS build
RUN npm install -g pnpm@10.29.3

# Same relative layout as on the host, so that the link:../nextgraph-rs/...
# dependencies resolve unchanged.
WORKDIR /ws

# The linked SDK packages export their TypeScript sources, which the app's vite
# compiles; only their own runtime dependencies need installing. Their imports
# of @ng-org/lib-wasm (wasm-pack output) are type-only, hence the stub.
COPY --from=ngrepo tsconfig.base.json nextgraph-rs/
COPY --from=ngrepo sdk/js/web nextgraph-rs/sdk/js/web
COPY --from=ngrepo sdk/js/orm nextgraph-rs/sdk/js/orm
COPY --from=ngrepo sdk/js/alien-deepsignals nextgraph-rs/sdk/js/alien-deepsignals
COPY --from=ngrepo sdk/js/shex-orm nextgraph-rs/sdk/js/shex-orm
RUN cd nextgraph-rs \
    && rm -rf sdk/js/*/node_modules sdk/js/*/dist \
    && printf 'packages:\n  - sdk/js/lib-wasm/pkg\n  - sdk/js/web\n  - sdk/js/orm\n  - sdk/js/alien-deepsignals\n  - sdk/js/shex-orm\n' > pnpm-workspace.yaml \
    && printf '{"name":"ng-local","private":true}\n' > package.json \
    && mkdir -p sdk/js/lib-wasm/pkg \
    && printf '{"name":"@ng-org/lib-wasm","version":"0.1.2","main":"lib_wasm.js","types":"lib_wasm.d.ts"}\n' > sdk/js/lib-wasm/pkg/package.json \
    && printf 'export {};\n' > sdk/js/lib-wasm/pkg/lib_wasm.d.ts \
    && touch sdk/js/lib-wasm/pkg/lib_wasm.js \
    && pnpm install --prod

WORKDIR /ws/nextgraph-admin-app
COPY package.json pnpm-workspace.yaml ./
RUN pnpm install
COPY . .
RUN pnpm exec vite build

FROM nginx:alpine
COPY --from=build /ws/nextgraph-admin-app/dist /usr/share/nginx/html
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 4173;
    root /usr/share/nginx/html;
    location / {
        try_files $uri /index.html;
    }
}
EOF
