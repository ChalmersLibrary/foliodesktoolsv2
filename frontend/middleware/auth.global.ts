import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/store/auth';

// Safari-safe base64url decode (handles missing padding and URL-safe chars)
function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) {
    base64 += '='.repeat(4 - pad);
  }
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  );
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const { exp } = JSON.parse(decodeBase64Url(payload));
    if (!exp) return true;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export default defineNuxtRouteMiddleware((to) => {
  const { authenticated } = storeToRefs(useAuthStore()); // make authenticated state reactive
  const token = useCookie('token'); // get token from cookies

  // Clear expired tokens
  if (token.value && isTokenExpired(token.value)) {
    token.value = null;
    authenticated.value = false;
  }

  if (token.value) {
    authenticated.value = true;
  }

  // if token exists and url is /login redirect to homepage
  if (token.value && to?.name === 'login') {
    const lastRoute = import.meta.client ? localStorage.getItem('lastRoute') : null;
    return navigateTo(lastRoute || '/');
  }
  
  // if token doesn't exist redirect to log in
  if (!token.value && to?.name !== 'login') {
    abortNavigation();
    return navigateTo('/login');
  }

  // Save last visited route for authenticated users (restore after PWA restart)
  if (import.meta.client && token.value && to?.name !== 'index') {
    localStorage.setItem('lastRoute', to.fullPath);
  }
});