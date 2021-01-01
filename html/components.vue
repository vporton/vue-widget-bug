<template>
    <div>
        <span className="Address">
            <input type="text"
                   maxLength="42"
                   size="50"
                   value="value"
                   change="onChange(this.value)"
                   className="isAddressValid(props.value) ? '' : 'error'"/>
        </span>
    </div>
</template>

<script>
function isAddressValid(v) {
  return true; // Web3.utils.isAddress(v);
}

export {
  Address: {
    name: "Address",
    props: ['onchange'],
    data() {
      return {
         value: "",
      }
    },
    methods: {
      onChange(value) {
        this.value = value;
      },
    },
  },
}
</script>

<style scoped>
</style>