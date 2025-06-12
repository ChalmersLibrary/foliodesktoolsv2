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
  }),
  actions: {
    async authenticateUser({ username, password }: UserPayloadInterface) {
      // useFetch from nuxt 3
      // const { data, pending }: any = await useFetch('https://dummyjson.com/auth/login', {
      const { data, pending }: any = await useFetch('/api/session/login', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: {
          username,
          password,
        },
      });
      this.loading = pending;

      if (data.value) {
        // console.log(data.value);
        
        const token = useCookie('token', {expires: new Date(data?.value?.exp * 1000)}); // useCookie new hook in nuxt 3
        token.value = data?.value?.token; // set token to cookie
        this.authenticated = true; // set authenticated  state value to true
        this.username = data?.value?.username;
      }
    },
    logUserOut() {
      const token = useCookie('token'); // useCookie new hook in nuxt 3
      this.authenticated = false; // set authenticated  state value to false
      this.username = null;
      token.value = null; // clear the token cookie
    },
  },
});