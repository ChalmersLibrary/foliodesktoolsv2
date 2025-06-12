<template>
  <!-- <div>{{ shelfList.length }}</div> -->
  <div v-if="shelfList.length > 0">
    <div class="shelfList avoidPageBreak" v-for="request in shelfList" key="request.id">
      <strong>Patron name:</strong>
      {{ request.requester.firstName }}<br />
      <strong>Title:</strong> {{ request.instance.title }} ({{
      request.item.barcode }})<br />
      <strong>Exemplar kod:</strong> {{ request.item.barcode }}<br />
      <strong>CallNumber:</strong> {{ request.item.callNumber }}
      {{request.item.callNumberComponents.suffix}}<br />
      <strong>Request status:</strong> {{ request.status }} <br />
      <strong>HoldshelfExpiration: </strong>
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
</script>

<style scoped>
  .shelfList {
    margin: 0.5rem;
  }
</style>