<!-- vim: expandtab ts=2 sts=2
  A widget to register a new service: a "Create" button unfolding a short
  form to input the name, IP and port (the service is registered disabled,
  on purpose).
  Input: services, the array of Service.
  Output: that same array, reset to null after a creation to trigger a refetch.
-->
<script lang="ts">
  import { ngSession } from '@ng-org/orm'

  let { services = $bindable(), selected_service = $bindable() } = $props()
  let unfolded = $state(false)
  let working = $state(false)
  let error: string | null = $state(null)

  let name = $state("")
  let ip = $state("")
  let port = $state("")

  let port_valid = $derived(/^\d+$/.test(port.trim()) &&
                            +port >= 1 && +port <= 65535)
  let can_submit = $derived(name.trim() !== "" && ip.trim() !== "" && port_valid)

  async function onSubmit(ev: SubmitEvent) {
    ev.preventDefault()
    const { ng, session } = await ngSession
    working = true
    try {
      await ng.admin_plugin_service_register(
        session.session_id, name.trim(), ip.trim(), +port)
      unfolded = false
      name = ip = port = ""
      /* Reset the services, so the list is fetched anew (will trigger the
       * parent): */
      selected_service = null
      services = null
    } catch (e) {
      error = String(e)
    }
    working = false
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
{:else if !unfolded}
  <div class="flex items-center gap-2">
    <button class="btn btn-sm btn-primary btn-outline"
            onclick={() => unfolded = true}>
      Create
    </button>
  </div>
{:else}
  <form class="flex flex-wrap items-center gap-2" onsubmit={onSubmit}>
    <label class="input input-sm grow">
      <span class="label">Name</span>
      <input type="text" bind:value={name} />
    </label>
    <label class="input input-sm grow">
      <span class="label">IP</span>
      <input type="text" bind:value={ip} />
    </label>
    <label class="input input-sm w-32"
           class:input-error={port !== "" && !port_valid}>
      <span class="label">Port</span>
      <input type="text" bind:value={port} />
    </label>
    <button type="submit" class="btn btn-sm btn-primary"
            disabled={!can_submit}>
      Submit
    </button>
    <button type="button" class="btn btn-sm"
            onclick={() => unfolded = false}>
      Cancel
    </button>
  </form>
{/if}
