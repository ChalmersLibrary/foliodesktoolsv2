<template>
  <div class="user">
    <h2>PIN code reset</h2>
    <label for="barcode">Barcode</label>
    <input type="text" autocomplete="off" autofocus v-model="barcode" v-on:keyup.enter="getUser">
    <button @click="getUser">Fetch</button>
    <div v-if="user">
      <div>Name: {{user.personal.lastName}} {{user.personal.firstName}} {{user.personal.middleName}}</div>
      <div>Username: {{user.username}}</div>
      <div>Barcode: {{user.barcode}}</div>
      <div>Active: {{user.active}}</div>
      <div>Email: {{user.personal.email}}</div>
      <div>External system id: {{user.externalSystemId}}</div>
      <div v-if="user.pwdReset && user.active">
        <label for="pin1">Pin</label>
        <input v-model="pin1" type="password" autocomplete="off">
        <br>
        <label for="pin2">Pin again</label>
        <input v-model="pin2" type="password" autocomplete="off" v-on:keyup.enter="changePin">
        <!-- <div v-if="pinOk">Match</div> -->
        <button v-if="pinOk" @click="changePin">Change pin</button>
        <div v-else>Enter matching pin codes with 6 digits.</div>
      </div>
      <br>
      <div v-if="pinMessageOk" class="pinMessageOk">{{pinMessageOk}}</div>
      <div v-if="pinMessage" class="pinMessage">{{pinMessage}}</div>
      <br>
      <button ref="clear" @click="clear">Clear</button>
    </div>
    <div v-else-if="searched" class="pinMessage">
      User not found.
    </div>
    <PinHelp />
  </div>
</template>

<script setup>
  const barcode = ref('')
  const user = ref()
  const pin1 = ref(null)
  const pin2 = ref(null)
  const pinMessage = ref(null)
  const pinMessageOk = ref(null)
  const searched = ref(false)
  const pinOk = computed(() => {
    return pin1.value === pin2.value && pin1.value !== null && pin1.value.length == 6 && pin1.value != user.value.username.substring(0, 6)
  })

  const getUser = async () => {
    pinMessage.value = null
    searched.value = true
    const {data: userResponse} = await useFetch(`/api/user/${barcode.value}`)
    user.value = userResponse.value
    if(user.value.pwdReset == false) {
      pinMessage.value = 'Pin reset not allowed'
    }
    if(user.value.active != true) {
      pinMessage.value = 'User not active'
    }
  }

  const clear = () => {
    barcode.value=null
    user.value=null
    pin1.value=null
    pin2.value=null
    pinMessage.value=null
    pinMessageOk.value=null
    searched.value=false
  }
  const changePin = async () => {
    if(pin1.value === pin2.value) {
      let postdata = {
        username: user.value.username,
        password: pin1.value
      }
      try {
        const { data: changePwd } = await $fetch("/api/user/changepin", {
          method: 'POST',
          body: postdata
        })
        pin1.value=null
        pin2.value=null
        pinMessageOk.value= "Pin changed successfully"
        pinMessage.value = ""
        
      } catch (error) {
        console.log(error.message)
        pin1.value=null
        pin2.value=null
        pinMessageOk.value= null
        pinMessage.value = "Something went wrong"
      }
      
    }
  }
</script>

<style scoped>
  button, input {
    margin-left: .5rem;
  }
  .pinMessageOk {
    color: green;
  }
  .pinMessage {
    color: red;
  }
</style>