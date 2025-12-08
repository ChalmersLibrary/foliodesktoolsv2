<template>
  <header class="noprint">
    <div class="topnav" id="myTopnav">
      <nuxt-link class="navlink" to="/">Home</nuxt-link>
      <nuxt-link class="navlink" to="/about">About</nuxt-link>
      <nuxt-link class="navlink" v-if="authenticated" to="/pinreset">Pin Reset</nuxt-link>
      <nuxt-link class="navlink" v-if="authenticated" to="/slips">Paging slips</nuxt-link>
      <nuxt-link class="navlink" v-if="authenticated" to="/shelf">Shelf clearance</nuxt-link>

      <nuxt-link v-if="!authenticated" class="navlink loginBtn floatRight" to="/login">Login</nuxt-link>
      <nuxt-link v-else class="navlink loginBtn floatRight" @click="logout">Logout</nuxt-link>
      <nuxt-link id="toggleLink" @click="showMenu">
        <svg id="burger" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M4 5C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H4ZM7 12C7 11.4477 7.44772 11 8 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H8C7.44772 13 7 12.5523 7 12ZM13 18C13 17.4477 13.4477 17 14 17H20C20.5523 17 21 17.4477 21 18C21 18.5523 20.5523 19 20 19H14C13.4477 19 13 18.5523 13 18Z" fill="#000000"/>
        </svg>
      </nuxt-link>
    </div>
  </header>
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

  onMounted(async () => {
    let navLinks = document.querySelector(".navlink")
    let x = document.getElementById("myTopnav")
    navLinks?.addEventListener("click", () => {
      x.className = "topnav"
      console.log("Closing");
      
    })
  }) 

  function showMenu() {
    let x = document.getElementById("myTopnav")
    if (x?.className === "topnav") {
      x.className += " responsive"
    } else {
      x.className = "topnav"
    }
  }
</script>

<style lang="css">
  .topnav {
    background-color: #333;
    overflow: hidden;
  }

  /* Style the links inside the navigation bar */
  .topnav a {
    float: left;
    display: block;
    color: #f2f2f2;
    text-align: center;
    padding: 14px 16px;
    text-decoration: none;
    font-size: 17px;
  }
  .topnav a:hover {
    background-color: #ddd;
    color: black;
  }
  .topnav #toggleLink {
    display: none;
  }
  #burger {
    height: 1em;
    & path {
      fill: white;
    }
  }

  .loginBtn {
    background-color: #04aa6d;
  }

  @media screen and (max-width: 768px) {
    .topnav a:not(:first-child) {display :none;}
    .topnav a#toggleLink {
      float:right;
      display: block;
    }
  }
  @media screen and (max-width: 768px) {
    .topnav.responsive {position: relative}
    .topnav.responsive a#toggleLink {
      position: absolute;
      right: 0;
      top: 0;
    }
    .topnav.responsive a {
      float: none;
      display: block;
      text-align: left;
    }
  }
  .topnav .floatRight {
    float: right;
  }

</style>
