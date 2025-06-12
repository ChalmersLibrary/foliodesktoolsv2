<template>
  <div>About Page</div>
  <pre>{{ username }}</pre>
</template>
<script lang="ts" setup>
  const headers = {authorization: useCookie('token')}
  const { data: username } = await useFetch('/api/info', {headers})
</script>