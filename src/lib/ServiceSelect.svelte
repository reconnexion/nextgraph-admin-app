<!-- vim: expandtab ts=2 sts=2
  A widget to choose a service.
  Input: services, a list of Service.
  Output: the selected service index
-->
<script lang="ts">
  let { services, selected_service = $bindable() } = $props()
</script>

<div class="flex flex-col gap-2">
  {#each services as service, i}
    <label class="label cursor-pointer justify-start gap-3 rounded-lg border border-base-300 px-3 py-2 hover:bg-base-200">
      <input type="radio" name="service" value={i}
             class="radio radio-primary radio-sm"
             bind:group={selected_service} />
      <span class="grow">{service.name}</span>
      <span class="font-mono text-sm text-base-content/60">{service.ip}:{service.port}</span>
      {#if service.globally_enabled}
        <span class="badge badge-secondary badge-sm">ENABLED</span>
      {:else}
        <span class="badge badge-ghost badge-sm text-base-content/60">DISABLED</span>
      {/if}
    </label>
  {/each}
</div>
