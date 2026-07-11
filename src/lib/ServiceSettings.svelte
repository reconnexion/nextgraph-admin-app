<!-- vim: expandtab ts=2 sts=2
  Given a Service, offer to update its configuration: the IP, the port and
  the globally_enabled flag (the name only identifies the service).
  Input: services, an array of Service, and selected_service, an index in that array
  Output: That same services array, with updated properties
-->
<script lang="ts">
  import { ngSession } from '@ng-org/orm'

  let { services = $bindable(), selected_service = $bindable() } = $props()
  let working = $state(false)
  let error: string | null = $state(null)

  /* Local edit state for the two inputs, reset whenever another service is
   * selected: */
  let ip = $state("")
  let port = $state("")
  $effect(() => {
    ip = services[selected_service].ip
    port = String(services[selected_service].port)
  })

  let port_valid = $derived(/^\d+$/.test(port.trim()) &&
                            +port >= 1 && +port <= 65535)
  let changed = $derived(ip !== services[selected_service].ip ||
                         port !== String(services[selected_service].port))

  async function update_service(enabled: boolean) {
    const { ng, session } = await ngSession
    working = true
    try {
      const service = $state.snapshot(services[selected_service])
      /* TODO: drop the fallback once the SDK implements services: */
      if (ng.admin_plugin_service_update) {
        await ng.admin_plugin_service_update(
          session.session_id, service.name, ip, +port, enabled)
      } else {
        console.warn("The SDK has no admin_plugin_service_update yet, only updating locally!")
      }
      // Will trigger the parent:
      services[selected_service].ip = ip
      services[selected_service].port = +port
      services[selected_service].globally_enabled = enabled
    } catch (e) {
      error = String(e)
    }
    working = false
  }

  function onToggleEnabled() {
    update_service(!services[selected_service].globally_enabled)
  }

  function onApply() {
    update_service(services[selected_service].globally_enabled)
  }
</script>

{#if working}
  <div class="flex items-center gap-2 text-base-content/60">
    <span class="loading loading-spinner loading-sm"></span> working…
  </div>
{:else if error}
  <div role="alert" class="alert alert-error">
    <span>Error: {error}</span>
  </div>
{:else}
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <label class="input input-sm grow">
        <span class="label">IP</span>
        <input type="text" bind:value={ip} />
      </label>
      <label class="input input-sm w-32" class:input-error={!port_valid}>
        <span class="label">Port</span>
        <input type="text" bind:value={port} />
      </label>
      <button class="btn btn-sm btn-primary"
              disabled={!changed || !port_valid || ip.trim() === ""}
              onclick={onApply}>
        Apply
      </button>
    </div>
    <div class="flex items-center gap-2">
      <button class="btn btn-sm btn-secondary"
              class:btn-outline={!services[selected_service].globally_enabled}
              onclick={onToggleEnabled}>
        {services[selected_service].globally_enabled ? "Disable" : "Enable"}
      </button>
    </div>
  </div>
{/if}
