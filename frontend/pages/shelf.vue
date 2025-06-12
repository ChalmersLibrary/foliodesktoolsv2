<template>
  <div class="shelf">
    <div class="servicepoints noprint">
      <span class="btn" :class="{active: library.id == selectedLibrary}" @click="libSelect(library.id)" v-for="library in libraries" :key="library.id"> {{library.name}} </span>
    </div>
    <div v-if="finishedLoading">
      <!-- <span class="btn" @click="getShelfList()">🔄</span> -->
      <span class="noprint">
        <span class="btn-noborder" @click="getShelfList()">🔄</span> <span>Last updated: {{ updated.toLocaleTimeString("sv-SE") }}</span>
      </span>
      <ShelfClearceList class="avoidPageBreak" :shelfList="shelfList" />
    </div>
  </div>
  <!-- {{ selectedLibrary }}
  {{ shelfList }} -->
</template>

<!-- <script>
  export default {
    data() {
      return {
        libraries: [],
        shelfList: []
      }
    }
    async fetch() {
      
    }
  }
</script> -->
<script setup lang="ts">
  const library = ref()
  const selectedLibrary = ref(null)
  const finishedLoading = ref(false)
  const updated = ref()
  const shelfList = ref([])
  const shelfTotal = ref()
  
  const { data: libraries } = await useFetch('/api/getServicePoints')
  
  const libSelect = (id) => {
    selectedLibrary.value = id
    getShelfList()
  }

  const getShelfList = async () => {
    finishedLoading.value = false
    updated.value = new Date()
    // shelfList.value = null
    const { data: shelfListResponse} = await useFetch(`/api/getShelfList/${selectedLibrary.value}`, {server: false})
    shelfList.value = shelfListResponse.value.requests
    shelfTotal.value = shelfListResponse.value.totalRecords
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
  .btn-noborder {
    /* border: 1px solid black; */
    /* border-radius: 5px; */
    padding: .2rem;
    margin: .3rem;
    cursor: pointer;
    display: inline-block;
  }
  .active {
    background: blue;
    color: white;
  }
</style>