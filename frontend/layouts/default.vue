<template>
  <div class="wrapper">
    <header class="noprint">
      <ul>
        <li><nuxt-link to="/">Home</nuxt-link></li>
        <li><nuxt-link to="/about">About</nuxt-link></li>
        <template v-if="authenticated">
          <li><nuxt-link to="/pinreset">Pin Reset</nuxt-link></li>
          <li><nuxt-link to="/slips">Paging slips</nuxt-link></li>
          <li><nuxt-link to="/shelf">Shelf clearance</nuxt-link></li>
          <li class="loginBtn">
            <nuxt-link @click="logout">Logout</nuxt-link>
          </li>
        </template>
        <li v-if="!authenticated" class="loginBtn">
          <nuxt-link to="/login">Login</nuxt-link>
        </li>
      </ul>
    </header>
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
  header {
    position: fixed;
    top: 0;
    width: 100%;
    & ul {
      list-style-type: none;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background-color: #333;

      & li {
        float: left;
        border-right: 1px solid #bbb;
      }

      & li:last-child {
        border-right: none;
      }

      & li a {
        display: block;
        color: white;
        text-align: center;
        padding: 14px 16px;
        text-decoration: none;
        cursor: pointer;
      }

      & li a:hover:not(.loginBtn) {
        background-color: #111;
      }
    }
    & .loginBtn {
      background-color: #04aa6d;
      float: right;
    }
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