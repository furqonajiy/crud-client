export function setCookie(name: string, value: string, days = 1): void {
  console.log("Set Cookie " + name)

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

export function getCookieInt(name: string): number | null {
  console.log("Get Cookie " + name)

  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? parseInt(decodeURIComponent(m[1]), 10) : null;
}
