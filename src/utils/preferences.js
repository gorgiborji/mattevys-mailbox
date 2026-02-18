const STORAGE_KEY = 'mattevy_username';

export function getUsername() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function saveUsername(name) {
  if (name && name.trim()) {
    localStorage.setItem(STORAGE_KEY, name.trim());
  }
}
