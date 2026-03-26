<template>
  <!-- <div>{{ shelfList.length }}</div> -->
  <div v-if="shelfList.length > 0">
    <p>{{ shelfList.length }} <span v-if="shelfList.length == 1">book</span><else v-else>books</else> to clear from shelf.</p>
    <div class="shelfList avoidPageBreak" v-for="request in sortedShelfList" key="request.id">
      <!-- Sortera på namn -->
      <span>Patron name: </span>
      <strong>{{ request.requester.firstName }}</strong><br />
      <span>Title:</span> {{ request.instance.title }}
       <!-- ({{request.item.barcode }}) -->
       <br />
      <span>Barcode: </span> {{ request.item.barcode }}<br />
      <!-- <strong>CallNumber:</strong> {{ request.item.callNumber }}
      {{request.item.callNumberComponents.suffix}}<br /> -->
      <span>Request status: </span> {{ request.status }} <br />
      <span>HoldshelfExpiration: </span>
      <span v-if="request.holdShelfExpirationDate != undefined">{{ request.holdShelfExpirationDate.substring(0, 10) }}</span>
      <span v-else>-</span>
      <br />
    </div>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps({
    shelfList: {
      type: Object,
      required: true
    }
  })
  const { shelfList } = props
  const sortedShelfList = shelfList.sort((a,b) => {
    a = a.requester.firstName.toLowerCase()
    b = b.requester.firstName.toLowerCase()
    return a < b ? -1 : a > b ? 1 : 0
  })
</script>

<style scoped>
  .shelfList {
    margin: 0.5rem;
  }
</style>