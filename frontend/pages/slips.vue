<template>
  <div class="noprint" v-if="finishedLoading">
    <span>Last updated: <span>{{ updateTime }}</span></span><span class="btn-noborder" @click="getSlips()">🔄</span>
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
    <div class="request avoidPageBreak" v-for="request in filteredRequests" :key="request.id">
      <div>
        <strong>Location:</strong>
        <span>{{ request.item.location.name }}</span>
        <span>{{ request.item.location.libraryName }}</span>
      </div>
      <div>
        <strong>Callnumber:</strong>
        <span>
          {{ request.item.callNumber }}
          {{request.item.callNumberComponents.suffix}}
        </span>
      </div>
      <div>
        <div class="authors">
          <strong>Author/s:</strong>
          <span
            v-for="author in request.instance.contributorNames"
            v-html="author.name" :key="author.name"
          >
          </span>
        </div>
        <strong>Title:</strong> <span>{{ request.instance.title }}</span>
      </div>
      <div v-if="request.instance.editions!=null">
        <strong>Edition:</strong>
        <span>{{ request.instance.editions[0] }}</span>
      </div>
      <!-- <div>
        {{ request.instance.editions!=null?request.instance.editions[0]:'Null' }}
        <pre>{{ JSON.stringify(request.instance,null,2)}}</pre>
      </div> -->
      <div>
        <strong>Barcode:</strong>
        <span>{{ request.item.barcode }}</span>
      </div>
      <div>
        <strong>Status:</strong>
        <span>{{ request.item.status }}</span>
      </div>
      <div>
        <strong>ServicePoint:</strong>
        <span>
          {{ request.pickupServicePoint.name }}
        </span>
      </div>
      <div>
        <strong>Requester:</strong>
        <span>
          {{ request.requester.lastName }} {{ request.requester.firstName }} {{ request.requester.middleName }} -- {{ request.requester.patronGroup.group}}
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
  .librarylist {
    margin-bottom: 1rem;
  }
  .request {
    margin-bottom: 1rem;
  }
</style>