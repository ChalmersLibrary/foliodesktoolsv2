import { defineStore } from 'pinia';

interface UserPayloadInterface {
  username: string;
  password: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    username: null,
    loading: false,
    errorMessage: ''
  }),
  actions: {
    async authenticateUser({username, password}: UserPayloadInterface) {
      const response:any = await $fetch('/api/session/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: { username, password}
      }).catch((error) => {
        this.errorMessage=error.data
        return error.data
      })
      
      const token = useCookie('token', {expires: new Date(response?.exp * 1000)})
      token.value = response.token
      this.authenticated = true
      this.username = response.username
    },
    logUserOut() {
      const token = useCookie('token'); // useCookie new hook in nuxt 3
      this.authenticated = false; // set authenticated  state value to false
      this.username = null;
      token.value = null; // clear the token cookie
      this.errorMessage = '';
    },
  },
});