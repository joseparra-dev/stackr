import type { Session, User } from '@supabase/supabase-js';

/**
 * Domain user — decoupled from `@supabase/auth-js`'s `User` so swapping
 * providers (or upgrading the SDK) only touches the mapping below.
 */
export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly name?: string;
  readonly avatarUrl?: string;
}

/** Narrowed set of lifecycle events the app actually reacts to. */
export type AuthEvent = 'INITIAL_SESSION' | 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED';

export interface AuthSubscription {
  readonly unsubscribe: () => void;
}

export function toAuthUser(user: User): AuthUser | null {
  if (!user.id || !user.email) return null;

  // `user_metadata` is a provider-specific bag. Google fills `full_name`,
  // `avatar_url`, and `picture`; other providers (Apple, GitHub) differ.
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name = typeof metadata['full_name'] === 'string' ? metadata['full_name'] : undefined;
  const avatarFromAvatar =
    typeof metadata['avatar_url'] === 'string' ? metadata['avatar_url'] : undefined;
  const avatarFromPicture =
    typeof metadata['picture'] === 'string' ? metadata['picture'] : undefined;

  return {
    id: user.id,
    email: user.email,
    name,
    avatarUrl: avatarFromAvatar ?? avatarFromPicture,
  };
}

export function sessionToAuthUser(session: Session | null): AuthUser | null {
  return session?.user ? toAuthUser(session.user) : null;
}
