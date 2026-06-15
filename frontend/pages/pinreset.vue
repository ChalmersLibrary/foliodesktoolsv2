<template>
  <div class="user">
    <h2>Återställ PIN-kod</h2>
    <label for="barcode">Username / Barcode</label>
    <input type="text" autocomplete="off" autofocus v-model="barcode" v-on:keyup.enter="getUser">
    <button @click="getUser">Hämta</button>
    <div v-if="user">
      <div>Namn: {{user.personal.lastName}} {{user.personal.firstName}} {{user.personal.middleName}}</div>
      <div>Username: {{user.username}}</div>
      <div>Barcode: {{user.barcode}}</div>
      <div>Active: {{user.active}}</div>
      <div>Email: {{user.personal.email}}</div>
      <div>External system id: {{user.externalSystemId}}</div>
      <div v-if="user.pwdReset && user.active">
        <label for="pin1">PIN-kod (6 siffror)</label>
        <input v-model="pin1" class="masked-input" autocomplete="off" maxlength="6">
        <br>
        <label for="pin2">PIN-kod igen</label>
        <input v-model="pin2" class="masked-input" autocomplete="off" v-on:keyup.enter="changePin"  maxlength="6">
        <br />
        <button v-if="pinOk" @click="changePin">Byt PIN-kod</button>
        <div v-else-if="pin1 && pin1.length == 6 && pin2 && pin2.length == 6">Pinkoderna är inte lika.</div>
      </div>
      <br>
      <div v-if="pinMessageOk" class="pinMessageOk">{{pinMessageOk}}</div>
      <div v-if="pinMessage" class="pinMessage">{{pinMessage}}</div>
      <br>
      <button ref="clear" @click="clear">Rensa</button>
    </div>
    <div v-else-if="searched" class="pinMessage">
      Användaren hittas inte.
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
  .masked-input {
    -webkit-text-security: disc;
  }
</style>