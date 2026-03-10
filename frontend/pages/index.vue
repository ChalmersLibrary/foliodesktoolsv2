<template>
  <h1>FOLIO Diskapp</h1>
  <MainInfo />
</template>

<script lang="ts" setup>
  const token = useCookie('token');

  // Redirect authenticated users to their last visited page after PWA restart
  if (import.meta.client && token.value) {
    const lastRoute = localStorage.getItem('lastRoute');
    if (lastRoute && lastRoute !== '/') {
      navigateTo(lastRoute);
    }
  }
</script>