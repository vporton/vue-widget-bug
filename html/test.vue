<script>
import { Address } from './test2.vue'

export default {
  name: 'Donate',
  components: {
    Address
  }
}
</script>

<template>
  <div>
    <p>
      <Address
        value=""
        onchange="await setTokenAddress(event.target.value)"/>
    </p>
  </div>
</template>
