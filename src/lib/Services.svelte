<!-- vim: expandtab ts=2 sts=2
  A widget to fetch the list of services.
  Input: none
  Output: the services.
-->
<script lang="ts">
  import { ngSession } from '@ng-org/orm'
  import { type Service } from '../tools'

  let { services = $bindable() } = $props()

  async function fetch_services() {
    console.warn("Fetching services!")
    const { ng, session } = await ngSession
    let svcs: Service[]
    /* TODO: drop the mock once the SDK implements services: */
    if (ng.admin_plugin_service_list) {
      svcs = await ng.admin_plugin_service_list(session.session_id)
    } else {
      console.warn("The SDK has no admin_plugin_service_list yet, using a mock list!")
      svcs = [
        { name: "sparql", ip: "127.0.0.1", port: 1234, globally_enabled: true },
        { name: "verifier", ip: "127.0.0.1", port: 1440, globally_enabled: true },
        { name: "webdav", ip: "127.0.0.1", port: 8080, globally_enabled: false },
      ]
    }
    svcs.sort((x, y) => x.name.localeCompare(y.name))
    services = svcs; // triggers parent
    return svcs // display our thing
  }

  /* Fetch at startup, and refetch whenever services is reset to null: */
  let services_prom = $derived(
    services === null ? fetch_services() : Promise.resolve(services));
</script>

{#await services_prom}
  <div class="flex items-center gap-2 text-base-content/60">
    <span class="loading loading-spinner loading-sm"></span> Loading list of services…
  </div>
{:then svcs}
  {#if svcs.length === 0}
    <p class="text-base-content/60 italic">No service found on this broker.</p>
  {:else}
    <div class="flex items-center gap-2 text-base-content/60">
      Got {svcs.length} service{#if svcs.length > 1}s{/if}.
    </div>
  {/if}
{:catch err}
  <div role="alert" class="alert alert-error">
    <span>Error: {String(err)}</span>
  </div>
{/await}
