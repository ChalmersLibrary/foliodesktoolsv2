<template>
  <div class="wrapper">
    <HeaderMenu />
    <main>
      <slot />
    </main>
    <footer class="noprint" v-if="authenticated">
      FolioDiskApp v.2.0
    </footer>
  </div>
</template>
<script lang="ts" setup>
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '~/store/auth';

  const router = useRouter();

  const { logUserOut } = useAuthStore();
  const { authenticated } = storeToRefs(useAuthStore()); // make authenticated state reactive

  const logout = () => {
    logUserOut();
    router.push('/login');
  };
</script>
<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    /* min-height: 100vh;
    width: 100%; */
    /* min-height: 100%; */
  }
 
  html,body, #__nuxt, #__layout, .wrapper{
    height:100%!important;
    width: 100%!important;
  }
  body {
    padding: 0;
    margin: 0;
    font-family: system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }

  main {
    /* padding: 16px; */
    margin-left: 2rem;
    margin-top: 3rem;
    /* margin: 3rem auto; */
    flex-grow: 1;
  }

  footer {
    flex-shrink: 0;
  }
  @media print {
    .noprint {
      display: none;
    }
    .avoidPageBreak {
      page-break-inside: avoid;
    }
    .pagebreak {
      page-break-after: always;
    }
  }
</style>