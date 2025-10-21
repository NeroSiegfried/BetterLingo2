// Authentication utilities for client-side

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface Session {
  token: string;
  expiresAt: Date;
}

export interface AuthData {
  user: User;
  session: Session;
}

// Store session in localStorage
export function saveSession(authData: AuthData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('session', JSON.stringify(authData));
  }
}

// Get session from localStorage
export function getSession(): AuthData | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('session');
    if (data) {
      const authData = JSON.parse(data);
      // Check if expired
      if (new Date(authData.session.expiresAt) < new Date()) {
        clearSession();
        return null;
      }
      return authData;
    }
  }
  return null;
}

// Clear session from localStorage
export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('session');
  }
}

// Login
export async function login(email: string, password: string): Promise<AuthData> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const authData = await response.json();
  saveSession(authData);
  return authData;
}

// Signup
export async function signup(email: string, password: string, name?: string): Promise<AuthData> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Signup failed');
  }

  const authData = await response.json();
  saveSession(authData);
  return authData;
}

// Logout
export async function logout() {
  const session = getSession();
  if (session) {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken: session.session.token }),
    });
    clearSession();
  }
}

// Verify session
export async function verifySession(): Promise<User | null> {
  const session = getSession();
  if (!session) return null;

  const response = await fetch('/api/auth/session', {
    headers: { 'Authorization': `Bearer ${session.session.token}` },
  });

  if (!response.ok) {
    clearSession();
    return null;
  }

  const data = await response.json();
  return data.user;
}

// Get authorization header
export function getAuthHeader(): { Authorization: string } | {} {
  const session = getSession();
  if (session) {
    return { Authorization: `Bearer ${session.session.token}` };
  }
  return {};
}
