<!-- vim: expandtab ts=2 sts=2
  A widget to list services and enable or deny the waiting ones.
  Enabled or denied services can be reverted to waiting.
  A service is identified by its name and peer_id.
  Input: services, a list of Service.
  Output: that same list, with updated statuses.
-->
<script lang="ts">
  import { ngSession } from '@ng-org/orm'
  import { type Service, type PluginStatus } from '../tools'

  type Props = {
    services: Service[];
  }

  let { services = $bindable() }: Props = $props()
  /* Index of the service being updated: */
  let working: number | null = $state(null)
  let error: string | null = $state(null)

  async function update_service(i: number, status: PluginStatus) {
    const { ng, session } = await ngSession
    working = i
    try {
      const service = $state.snapshot(services[i])
      await ng.admin_plugin_service_update(
        session.session_id, service.name, service.peer_id, status)
      services[i].status = status
    } catch (e) {
      error = String(e)
    }
    working = null
  }
</script>

<div class="flex flex-col gap-2">
  {#if error}
    <div role="alert" class="alert alert-error">
      <span class="grow">Error: {error}</span>
      <button class="btn btn-sm" onclick={() => error = null}>Dismiss</button>
    </div>
  {/if}
  {#each services as service, i}
    <div class="flex items-center gap-3 rounded-lg border border-base-300 px-3 py-2">
      <span class="grow">{service.name}</span>
      <span class="font-mono text-sm text-base-content/60">{service.peer_id}</span>
      {#if working === i}
        <span class="loading loading-spinner loading-sm"></span>
      {:else if service.status !== "Waiting"}
        {#if service.status === "Enabled"}
          <span class="badge badge-secondary badge-sm">ENABLED</span>
        {:else}
          <span class="badge badge-ghost badge-sm text-base-content/60">DENIED</span>
        {/if}
        <button class="btn btn-xs btn-ghost" disabled={working !== null}
                onclick={() => update_service(i, "Waiting")}>
          Revert
        </button>
      {:else}
        <button class="btn btn-xs btn-secondary" disabled={working !== null}
                onclick={() => update_service(i, "Enabled")}>
          Enable
        </button>
        <button class="btn btn-xs btn-error btn-outline" disabled={working !== null}
                onclick={() => update_service(i, "Denied")}>
          Deny
        </button>
      {/if}
    </div>
  {/each}
</div>
