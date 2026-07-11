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

export type UsageStats = {
  net: { ingress: number, egress: number },
  storage: { current: number, max: number },
  last_seen: number,
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
