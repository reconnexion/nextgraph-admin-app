function fromBase64Url(s: string): Uint8Array {
	return Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
		.slice(0, -1)  // drop the trailing tag byte
		.reverse()
}

export type PrivKey =
	| { Ed25519PrivKey: Uint8Array }
	| { X25519PrivKey: Uint8Array }

export type PubKey =
	| { Ed25519PubKey: Uint8Array }
	| { X25519PubKey: Uint8Array }

export function privKey(s: string): PrivKey {
	return { Ed25519PrivKey: fromBase64Url(s) }
}

export function pubKey(s: string): PubKey {
	return { Ed25519PubKey: fromBase64Url(s) }
}

export type NetStats = {
  ingress: number,
  egress: number,
}

export type StorageStats = {
  current: number,
  max: number,  // historical peak of `current`
}

export type UsageStats = {
  net: NetStats,
  storage: StorageStats,
  first_seen: number,  // unix timestamp in seconds, 0 meaning "never"
  last_seen: number,  // idem
}

// What admin_list_users returns for each user when called with hydrated=true:
export type HydratedListedUserV0 = {
  id: PubKey,
  is_admin: boolean,
  net_stats: NetStats,
  storage_stats: StorageStats,
  first_seen: number,  // as in UsageStats
  last_seen: number,
}

// admin_list_users returns a vector of those. This is the serialized form of
// the rust enum of the same name: the `Id` variant is what we get when calling
// with hydrated=false, and the `HydratedV0` one when calling with hydrated=true
// (in which case there is no need for a further admin_usage_stats call).
export type ListedUser =
  | { Id: PubKey }
  | { HydratedV0: HydratedListedUserV0 }

// The user id of a ListedUser, regardless of it being hydrated or not:
export function listedUserId(u: ListedUser): PubKey {
  return 'Id' in u ? u.Id : u.HydratedV0.id
}

export type RemoteUser = {
  key: PubKey,
  name: string,  // string form of the pubkey
  is_admin: boolean,
  is_me: boolean,  // is this the currently logged in user?
}

export type Service = {
  name: string, // the name of the service
  ip: string, // the IP address of the service
  port: number, // the port number of the service
  globally_enabled: boolean,  // Whether the service is enabled on this broker
}
