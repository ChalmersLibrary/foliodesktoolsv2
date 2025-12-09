<template>
  <div class="shelf">
    <div class="servicepoints noprint">
      <span class="btn" :class="{active: library.id == selectedLibrary}" @click="libSelect(library.id)" v-for="library in libraries" :key="library.id"> {{library.name}} </span>
    </div>
    <div v-if="finishedLoading">
      <span class="noprint">
        <span class="btn reload" @click="getShelfList()">Uppdatera</span> <span>Last updated: {{ updated.toLocaleTimeString("sv-SE") }}</span>
      </span>
      <ShelfClearceList class="avoidPageBreak" :shelfList="shelfList" />
    </div>
    <div v-if="!finishedLoading && selectedLibrary">
      <img src="/assets/1481.gif" alt="">
    </div>
    <ShelfHelp class="noprint" />
  </div>
</template>

<script setup lang="ts">
  const library:any = ref()
  const selectedLibrary = ref(null)
  const finishedLoading = ref(false)
  const updated = ref()
  const shelfList = ref([])
  const shelfTotal = ref()
  
  const { data: libraries } = await useFetch('/api/getServicePoints')
  
  const libSelect = (id:any) => {
    selectedLibrary.value = id
    getShelfList()
  }

  const getShelfList = async () => {
    finishedLoading.value = false
    updated.value = new Date()
    const shelfListResponse:any = await $fetch(`/api/getShelfList/${selectedLibrary.value}`)
    shelfList.value = shelfListResponse.requests
    shelfTotal.value = shelfListResponse.totalRecords
    finishedLoading.value = true
  }
</script>

<style scoped>
  .btn {
    border: 1px solid black;
    border-radius: 5px;
    padding: .2rem;
    margin: .3rem;
    cursor: pointer;
    display: inline-block;
  }
  .reload {
    background-color: lime;
  }
  .active {
    background: blue;
    color: white;
  }
</style>