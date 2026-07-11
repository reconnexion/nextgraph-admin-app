# Minimal example of Admin NextGraph App

## How to run

The simpler is to use the nextgraph-devstack docker compose services:

```
nextgraph-devstack $ make up
docker compose -p ng-dev up --detach
[+] up 3/3
 ✔ Container ng-dev-auth-1 Running          0.0s
 ✔ Container ng-dev-app-1  Running          0.0s
 ✔ Container ng-dev-ngd-1  Running          0.0s
```

Then provision a user, upload the admin wallet as described in nextgraph-devstack howto.
Then:

```
nextgraph-admin-app $ make run
...
pnpm exec vite preview --host 127.0.0.1
 ➜  Local:   http://127.0.0.1:4173/
 ➜  press h + enter to show help
```

Point your browser at [http://127.0.0.1:4173/](http://127.0.0.1:4173/), and log in.

