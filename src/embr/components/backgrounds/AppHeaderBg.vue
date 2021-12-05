<template>
  <div class="app-header-bg ">
    <div class="w-full max-w-3xl"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppHeaderBg',

  setup() {
    return {};
  }
});
</script>

<style>
.app-header-bg {
  display: none;
  /*background-image: url('/images/backgrounds/banner-medium.svg');*/
}
</style>
