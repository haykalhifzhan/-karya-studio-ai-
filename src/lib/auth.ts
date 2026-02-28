import type { User } from '@/types';

const JWT_SECRET = 'karya-studio-demo-secret-2026';

// Mock user database
const MOCK_USERS: Array<{ email: string; password: string; user: User }> = [
  {
    email: 'demo@karyastudio.id',
    password: 'demo123',
    user: {
      id: 'user-1',
      name: 'Demo User',
      email: 'demo@karyastudio.id',
      avatar: undefined,
      createdAt: '2026-01-01T00:00:00Z',
    },
  },
];

function base64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function signToken(payload: Record<string, unknown>): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(
    JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  );
  const signature = base64url(JWT_SECRET + header + body);
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function findUserByEmail(email: string) {
  return MOCK_USERS.find((u) => u.email === email);
}

export function authenticateUser(email: string, password: string): { user: User; token: string } | null {
  const entry = MOCK_USERS.find((u) => u.email === email && u.password === password);
  if (!entry) return null;
  const token = signToken({ userId: entry.user.id, email: entry.user.email });
  return { user: entry.user, token };
}

export function registerUser(name: string, email: string, password: string): { user: User; token: string } | null {
  if (MOCK_USERS.find((u) => u.email === email)) return null;
  const user: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    createdAt: new Date().toISOString(),
  };
  MOCK_USERS.push({ email, password, user });
  const token = signToken({ userId: user.id, email: user.email });
  return { user, token };
}
