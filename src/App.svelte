<!-- vim: expandtab ts=2 sts=2
Objective:
Try out the admin SDK, especially the new metrology functions.
Show the minimum steps to connect the local broker to the remote broker
and call admin functions of the SDK to display users usage statistics.
-->
<script lang="ts">
  /* Init NG */
  import { init, ng } from "@ng-org/web"
  import { initNg } from "@ng-org/orm"
  console.log("calling init...")
  init((event: any) => {
    console.log("callback!")
    initNg(ng, event.session)
  }, true, [])
  console.log("Called init")

  import { type RemoteUser, type Service } from './tools'

  import Users from './lib/Users.svelte'
  import UserSelect from './lib/UserSelect.svelte'
  import UserStats from './lib/UserStats.svelte'
  import UserSettings from './lib/UserSettings.svelte'
  import Services from './lib/Services.svelte'
  import ServiceList from './lib/ServiceList.svelte'

  let remote_users: RemoteUser[] | null = $state(null)
  /* The selected remote user whose stats we want to display: */
  let selected_user: number | null = $state(null)

  let services: Service[] | null = $state(null)

  /* Which tab is displayed: */
  let current_tab: 'users' | 'apps' = $state('users')

  /* Tab panels are only mounted while displayed, and the fetched data is
   * forgotten when switching, so that (re)opening a tab is what triggers
   * the SDK calls: */
  function goto_tab(tab: 'users' | 'apps') {
    current_tab = tab
    remote_users = null
    selected_user = null
    services = null
  }
</script>

<div class="min-h-screen bg-base-200">
  <div class="max-w-3xl mx-auto px-4 py-8 sm:py-12">
    <header class="mb-8 text-center">
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight">
        NextGraph <span class="text-primary">Admin</span>
      </h1>
      <p class="mt-2 text-base-content/60">
        Connect to your broker and edit its users and applications.
      </p>
    </header>

    <div role="tablist" class="tabs tabs-box justify-center mb-6">
      <button role="tab" class="tab" class:tab-active={current_tab === 'users'}
              onclick={() => goto_tab('users')}>
        Users
      </button>
      <button role="tab" class="tab" class:tab-active={current_tab === 'apps'}
              onclick={() => goto_tab('apps')}>
        Applications
      </button>
    </div>

    <!-- Users tab: -->
    {#if current_tab === 'users'}
    <div role="tabpanel">
    <ol class="flex flex-col gap-5">

      <li class="card bg-base-100 shadow-md">
        <div class="card-body gap-4">
          <div class="flex items-center gap-3">
            <h2 class="card-title grow">Fetching users</h2>
            {#if remote_users !== null}
              <span class="badge badge-success gap-1">✓ done</span>
            {/if}
          </div>
          <Users bind:remote_users={remote_users} />
        </div>
      </li>

      {#if remote_users !== null && remote_users.length > 0}
        <li class="card bg-base-100 shadow-md">
          <div class="card-body gap-4">
            <div class="flex items-center gap-3">
              <h2 class="card-title grow">Select a user</h2>
              {#if selected_user !== null}
                <span class="badge badge-success gap-1">✓ done</span>
              {/if}
            </div>
            <p class="text-sm text-base-content/70">Select a user to display her usage stats or modify her settings:</p>
            <UserSelect {remote_users} bind:selected_user={selected_user} />
          </div>
        </li>
      {/if}

      {#if remote_users !== null && selected_user !== null}
        <li class="card bg-base-100 shadow-md">
          <div class="card-body gap-4">
            <div class="flex items-center gap-3">
              <h2 class="card-title grow">Usage statistics</h2>
            </div>
            <UserStats remote_user={remote_users[selected_user]} />
          </div>
        </li>

        <li class="card bg-base-100 shadow-md">
          <div class="card-body gap-4">
            <div class="flex items-center gap-3">
              <h2 class="card-title grow">User Settings</h2>
            </div>
            <UserSettings bind:remote_users={remote_users} bind:selected_user={selected_user} />
          </div>
        </li>
      {/if}

    </ol>
    </div>
    {/if}

    <!-- Applications tab: -->
    {#if current_tab === 'apps'}
    <div role="tabpanel">
    <ol class="flex flex-col gap-5">

      <li class="card bg-base-100 shadow-md">
        <div class="card-body gap-4">
          <div class="flex items-center gap-3">
            <h2 class="card-title grow">Fetching services</h2>
            {#if services !== null}
              <span class="badge badge-success gap-1">✓ done</span>
            {/if}
          </div>
          <Services bind:services={services} />
        </div>
      </li>

      {#if services !== null && services.length > 0}
        <li class="card bg-base-100 shadow-md">
          <div class="card-body gap-4">
            <div class="flex items-center gap-3">
              <h2 class="card-title grow">Services</h2>
            </div>
            <p class="text-sm text-base-content/70">Enable or deny the services waiting for a decision:</p>
            <ServiceList bind:services={services} />
          </div>
        </li>
      {/if}

    </ol>
    </div>
    {/if}
  </div>
</div>
