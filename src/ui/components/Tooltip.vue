<template>
  <div class="relative group">
    <slot />
    <div class="hidden group-hover:block absolute z-20 break-normal max-w-3xl p-1 text-xs bg-gray-900 text-gray-100 opacity-75 rounded shadow mt-1"
      v-html="tip">
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tip: {
      type: String
    }
  }
}
</script>