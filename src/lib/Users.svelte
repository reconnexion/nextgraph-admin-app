<!-- vim: expandtab ts=2 sts=2
  A widget to fetch the list of users.
  Input: none
  Output: the users.
-->
<script lang="ts">
  import { ngSession } from '@ng-org/orm'
  import { type PubKey, type RemoteUser } from '../tools'

  let { remote_users = $bindable() } = $props()

  /* admin_list_users returns a vector of ListedUser which, as long as we do not
   * ask for hydrated users, is merely `Id(the_pubkey)`: */
  type ListedUser = { Id: PubKey }

  async function fetch_users() {
    console.warn("Fetching users!")
    const { ng, session } = await ngSession;
    console.log("session: ", session)
    /* Fetch the pubkeys of either all the admins or all the non admins: */
    const list_users = async (admins: boolean): Promise<PubKey[]> => {
      const listed: ListedUser[] = await ng.admin_list_users(
        session.session_id,
        admins,
        false,  /* hydrated */
        undefined,  /* after_user: start from the first one */
        undefined)  /* limit: no limit */
      return listed.map((u) => u.Id)
    }
    const admins = await list_users(true)
    const noadmins = await list_users(false)
    console.warn("Got admins: ", admins, " and non admins: ", noadmins)
    const users: RemoteUser[] = await Promise.all([
      ...admins.map((key: PubKey) => ({ key, is_admin: true })),
      ...noadmins.map((key: PubKey) => ({ key, is_admin: false })),
    ].map(async (u) => {
      const name = await ng.pubkey_to_string(u.key)
      return {
        ...u,
        name,
        /* session.user is the string form of the logged in user's pubkey: */
        is_me: name === session.user,
      }
    }));
    users.sort((x, y) => JSON.stringify(x.key).localeCompare(JSON.stringify(y.key)));
    remote_users = users; // triggers parent
    return users // display our thing
  }

  /* Fetch at startup, and refetch whenever remote_users is reset to null: */
  let users_prom = $derived(
    remote_users === null ? fetch_users() : Promise.resolve(remote_users));
</script>

{#await users_prom}
  <div class="flex items-center gap-2 text-base-content/60">
    <span class="loading loading-spinner loading-sm"></span> Loading list of users…
  </div>
{:then users}
  {#if users.length === 0}
    <p class="text-base-content/60 italic">No user found on this broker.</p>
  {:else}
    <div class="flex items-center gap-2 text-base-content/60">
      Got {users.length} user{#if users.length > 1}s{/if}.
    </div>
  {/if}
{:catch err}
  <div role="alert" class="alert alert-error">
    <span>Error: {String(err)}</span>
  </div>
{/await}
