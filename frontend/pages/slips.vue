<template>
  <div class="noprint" v-if="finishedLoading">
    <span>Last updated: <span>{{ updateTime }}</span></span><span class="btn reload" @click="getSlips()">Update</span>
  </div>
  <div class="noprint librarylist" v-if="requests.length > 0">
    <span class="btn bottom-margin" :class="{active: lib == selectedLibrary}" v-for="lib in libs" :key="lib" @click="select(lib)">{{lib}}</span>
  </div>
  <!-- <div v-else><img src="/assets/1481.gif" alt=""></div> -->
  <!-- <div v-if="finishedLoading && selectedLibrary"> -->
  <div v-if="finishedLoading">
    <div class="noprint bottom-margin">
      <span class="btn" @click="print()">Print</span>
      <label for="separatePages">
        <input
          type="checkbox"
          name="separatePages"
          id="separatePages"
          v-model="separatePages"
        />
        Separate Pages
      </label>
    </div>
    <div>Number of requested items: {{ filteredRequests.length }}</div>
    <p></p>
    <div class="request avoidPageBreak" v-for="request in filteredRequests" :key="request.id">
      <div>
        <span>Location: </span>
        <strong>{{ request.item.location.name }}</strong>
        <!-- <span>{{ request.item.location.libraryName }}</span> -->
      </div>
      <div>
        <span>Callnumber: </span>
        <strong>
          {{ request.item.callNumber }}
          {{request.item.callNumberComponents.suffix}}
        </strong>
      </div>
      <div>
        <span>Title: </span> <span>{{ request.instance.title }}</span>
      </div>
      <div>
        <div class="authors">
          <span>Author: </span>
          <span
            v-for="author in request.instance.contributorNames"
            v-html="author.name" :key="author.name"
          >
          </span>
        </div>
      </div>
      <div v-if="request.instance.editions!=null">
        <span>Edition: </span>
        <span>{{ request.instance.editions[0] }}</span>
      </div>
      <!-- <div>
        {{ request.instance.editions!=null?request.instance.editions[0]:'Null' }}
        <pre>{{ JSON.stringify(request.instance,null,2)}}</pre>
      </div> -->
      <div>
        <span>Barcode: </span>
        <strong>{{ request.item.barcode }}</strong>
      </div>
      <div>
        <span>Status: </span>
        <span>{{ request.item.status }}</span>
        <!-- Feta om item staus är in process -->
      </div>
      <div>
        <span>Pickup at: </span>
        <span>
          {{ request.pickupServicePoint.name }}
        </span>
      </div>
      <div>
        <span>Requester: </span>
        <span>
          {{ request.requester.lastName }} {{ request.requester.firstName }} {{ request.requester.middleName }}
          <!-- -- {{ request.requester.patronGroup.group}} -->
        </span>
      </div>
      <div v-if="request.item.location.libraryName == 'Bibliotekssystem'">
        <strong>Request ID</strong>
        <span><a target="_blank" :href="instanceLink(request.id)">{{  request.id }}</a></span>
      </div>
      <div v-if="separatePages" class="pagebreak"></div>
    </div>
  </div>
  <div v-else><img src="/assets/1481.gif" alt=""></div>
  <!-- <div v-else-if="!selectedLibrary && updated && requests && requests.length>0">Select a library above.</div>
  <div v-else-if="updated">Nothing paged</div> -->
  <PageHelp class="noprint" />
</template>

<script setup>
  const selectedLibrary = ref(null)
  const finishedLoading = ref(false)
  const updated = ref()
  const requests = ref([])
  const separatePages = ref()
  const libs = computed(() => {
    let libraries = [...new Set(requests.value.map(req => req.item.location.libraryName))]
    return libraries
  })
  const updateTime = computed(() => new Date(updated.value).toLocaleTimeString())
  const filteredRequests = computed(() => {
    return requests.value.filter(request => request.item.location.libraryName === selectedLibrary.value).sort((a,b) => {
      let location = a.item.location.name.localeCompare(b.item.location.name);
      let callNumber = (a.item.callNumber && b.item.callNumber) ? a.item.callNumber.localeCompare(b.item.callNumber) : -1;
      let suffix = (a.item.callNumberComponents.suffix && b.item.callNumberComponents.suffix) ? a.item.callNumberComponents.suffix.localeCompare(b.item.callNumberComponents.suffix) : -1; 
      return location || callNumber || suffix;      
    })
  })

  const print = () => {
    window.print()
  }
  
  const getSlips = async () => {
    updated.value = Date.now()
    finishedLoading.value = false
    requests.value=[]
    // const { data: slips } = await useFetch('/api/getPagingSlips', {server: false})
    const slips = await $fetch('/api/getPagingSlips')

    requests.value = slips.filter(request => {
      if (request.item !== undefined && request.item.status !== 'Missing') {
        return request
      }
    })

    finishedLoading.value = true
  }
  
  const select = (lib) => {
    selectedLibrary.value = lib
  }

  onMounted(async () => {
    await getSlips()
  })
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
    background-color: #04aa6d;
    color: white;
  }
  .active {
    background: #364497;
    color: white;
  }
  .librarylist {
    margin-bottom: 1rem;
  }
  .request {
    margin-bottom: 1rem;
  }
</style>