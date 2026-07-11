<!-- vim: expandtab ts=2 sts=2
  Given a RemoteUser, offer to update her configuration (for now, only the
  admin flag).
  Input: remote_users, an array of RemoteUser, and selected_user, an index in that array
  Output: That same remote_users array, with updated properties
-->
<script lang="ts">
  import { ngSession } from '@ng-org/orm'
  import { privKey, type RemoteUser } from "../tools"

  let { remote_users = $bindable(), selected_user = $bindable() } = $props()
  let num_admins =
    $derived(remote_users.filter((u: RemoteUser) => u.is_admin).length)
  let working = $state(false)
  let confirm_delete = $state(false)
  let confirm_unadmin = $state(false)
  let error: string | null = $state(null)

  /* Removing our own admin flag would break this app, so ask first: */
  function onToggleAdminClicked() {
    const user = remote_users[selected_user]
    if (user.is_admin && user.is_me) {
      confirm_unadmin = true
    } else {
      onToggleAdmin()
    }
  }

  async function onToggleAdmin() {
    confirm_unadmin = false
    const is_admin = !remote_users[selected_user].is_admin
    const { ng, session } = await ngSession
    working = true
    try {
      const user = $state.snapshot(remote_users[selected_user])
      await ng.admin_modify_user(session.session_id, user.key, is_admin)
      console.log("Admin set to: ", is_admin)
    } catch (e) {
      error = String(e)
    }
    // Will trigger the parent:
    remote_users[selected_user].is_admin = is_admin
    working = false
  }

  async function onDelete() {
    confirm_delete = false
    const { ng, session } = await ngSession
    working = true
    try {
      const user = $state.snapshot(remote_users[selected_user])
      await ng.admin_del_user(session.session_id, user.key)
      /* Reset the whole app state, so the list of users is fetched anew: */
      selected_user = null
      remote_users = null
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
{:else}
  <div class="flex items-center justify-between gap-2">
    <button class="btn btn-sm btn-secondary"
            class:btn-outline={!remote_users[selected_user].is_admin}
            disabled={remote_users[selected_user].is_admin && num_admins == 1}
            onclick={onToggleAdminClicked}>
      {remote_users[selected_user].is_admin ? "Remove Admin" : "Become Admin"}
    </button>
    <button class="btn btn-sm btn-error btn-outline"
            disabled={remote_users[selected_user].is_admin}
            onclick={() => confirm_delete = true}>
      Delete
    </button>
  </div>

  {#if confirm_delete}
    <div class="modal modal-open" role="dialog">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Delete this user?</h3>
        <p class="py-4 font-mono text-sm break-all">
          {remote_users[selected_user].name}
        </p>
        {#if remote_users[selected_user].is_me}
          <div role="alert" class="alert alert-warning">
            <span>This is the user you are logged in as:
                  deleting it will make this app malfunction!</span>
          </div>
        {/if}
        <div class="modal-action">
          <button class="btn" onclick={() => confirm_delete = false}>Cancel</button>
          <button class="btn btn-error" onclick={onDelete}>Delete</button>
        </div>
      </div>
      <button class="modal-backdrop" aria-label="Cancel"
              onclick={() => confirm_delete = false}></button>
    </div>
  {/if}

  {#if confirm_unadmin}
    <div class="modal modal-open" role="dialog">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Remove your own admin rights?</h3>
        <p class="py-4">
          You are logged in as this user, and this app needs admin rights
          to work: if you remove them, the app will cease functioning.
        </p>
        <div class="modal-action">
          <button class="btn" onclick={() => confirm_unadmin = false}>Cancel</button>
          <button class="btn btn-warning" onclick={onToggleAdmin}>Remove Admin</button>
        </div>
      </div>
      <button class="modal-backdrop" aria-label="Cancel"
              onclick={() => confirm_unadmin = false}></button>
    </div>
  {/if}
{/if}
