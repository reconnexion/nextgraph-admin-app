<!-- vim: expandtab ts=2 sts=2
  A widget to choose a user.
  Input: remote_users, a list of RemoteUser.
  Output: the selected user index
-->
<script lang="ts">
  let { remote_users, selected_user = $bindable() } = $props()
</script>

<div class="flex flex-col gap-2">
  {#each remote_users as user, i}
    <label class="label cursor-pointer justify-start gap-3 rounded-lg border border-base-300 px-3 py-2 hover:bg-base-200">
      <input type="radio" name="user" value={i}
             class="radio radio-primary radio-sm"
             bind:group={selected_user} />
      <span class="font-mono text-sm break-all grow">{user.name}</span>
      {#if user.is_me}
        <span class="badge badge-accent badge-sm gap-1"
              title="The user this app is logged in as">👋 YOU</span>
      {/if}
      {#if user.is_admin}
        <span class="badge badge-secondary badge-sm">ADMIN</span>
      {/if}
    </label>
  {/each}
</div>
