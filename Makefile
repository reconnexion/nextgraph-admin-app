.PHONY: all clean run docker

TARGET ?= debug
ifdef NDEBUG
TARGET = release
endif

all: dist/index.html

clean:
	@echo TODO

pnpm-lock.yaml: package.json
	pnpm install &&\
	touch $@

# FIXME: too much noise therefore "|| true"
type_check.ok: \
  tsconfig.json \
  vite.config.ts \
  $(wildcard src/*.ts) \
  $(wildcard src/*.svelte) \
  $(wildcard src/lib/*.svelte)
	pnpm exec svelte-check --tsconfig ./tsconfig.app.json || true
	date > $@

dist/index.html: \
  pnpm-lock.yaml \
  type_check.ok
	pnpm exec vite build

# Note: node listens only to IPv6 by default, can't listen to both, so here we
# pick the lesser evil:
run: dist/index.html
	pnpm exec vite preview --host 127.0.0.1

docker: docker/Dockerfile
	docker build --progress=plain \
	  -t ghcr.io/reconnexion/ng-dev-demo-admin \
	  -f $< --build-context ngrepo=../nextgraph-rs .
