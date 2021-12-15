<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppNav from '@/embr/components/navs/AppNav.vue';
import AppFooterNav from '@/components/navs/AppFooterNav/AppFooterNav.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import AppHeaderBg from '@/embr/components/backgrounds/AppHeaderBg.vue';
import AppHero from '@/embr/components/heroes/AppHero.vue';
import GlobalStats from '@/embr/components/stats/GlobalStats.vue';

/**
 * COMPOSABLES
 */
const route = useRoute();
const { upToXLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const isFarmsPage = computed(() => route.path === '/farm');
const isPortfolioPage = computed(() => route.path === '/my-portfolio');
const isInvestPage = computed(() => {
  return route.path === '/pools';
});
const isTradePage = computed(() => {
  return route.path === '/trade';
});
const showGlobalStats = computed(() => {
  return isInvestPage.value || isFarmsPage.value || isTradePage.value;
});
const isHomePage = computed(() => route.path === '/');
</script>

<template>
  <div>
    <AppNav />
    <AppHeaderBg />
    <div class="relative">
      <AppHero v-if="isInvestPage" />
      <!--      <GlobalStats v-if="showGlobalStats" />-->
    </div>
    <div class="pb-16 relative">
      <router-view :key="$route.path" />
    </div>
    <AppFooterNav v-if="upToXLargeBreakpoint" />
    <div class="flex flex-1 items-end relative">

      <div
        class="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex justify-center pb-6 ml-8"
      >
        <a href="https://twitter.com/embrfinance" class="mr-12">
          <img
            src="~@/embr/assets/images/twitter-icon.png"
            width="40"
            class="mx-auto"
          />
        </a>
        <a href="https://embrfinance.medium.com/" class="mr-12">
          <img
            src="~@/embr/assets/images/medium-icon.png"
            width="40"
            class="mx-auto"
          />
        </a>
        <a href="https://discord.gg/jedS4zGk28" class="mr-12">
          <img
            src="~@/embr/assets/images/discord-icon.png"
            width="40"
            class="mx-auto"
          />
        </a>
        <a href="https://docs.embr.finance/" class="mr-12">
          <img
            src="~@/embr/assets/images/gitbook-logo.png"
            width="40"
            class="mx-auto"
          />
        </a>
        <a href="https://github.com/embrfinance">
          <img
            src="~@/embr/assets/images/github-logo.png"
            width="40"
            class="mx-auto"
          />
        </a>
      </div>
      <div
        class="absolute bottom-0"
        style="padding-bottom:10px;padding-right:15px"
      >
                  <img id="embryfooter" src="~@/embr/assets/images/footer-bg7.png" />
        <img src="~@/embr/assets/images/EmbrPoweredbyAve4.png" width="196" />
      </div>
    </div>
  </div>
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}

#intercom-activator {
  z-index: 2147483004;
}
</style>
