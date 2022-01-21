<template>
  <div :class="`app-nav-toggle`">
    <router-link
      :to="{ name: 'trade' }"
      :class="['toggle-link px-6', { [activeClasses]: isTradePage }]"
      @click="trackGoal(Goals.ClickNavTrade)"
    >
      Trade
    </router-link>
    <router-link
      :to="{ name: 'pools' }"
      :class="['toggle-link px-6', { [activeClasses]: isInvestPage }]"
      @click="trackGoal(Goals.ClickNavInvest)"
    >
      Pools
    </router-link>
    <router-link
      :to="{ name: 'stake' }"
      :class="['toggle-link px-4', { [activeClasses]: isStakePage }]"
    >
      Stake
    </router-link>

    <router-link
      :to="{ name: 'my-portfolio' }"
      :class="['toggle-link px-4', { [activeClasses]: isPortfolioPage }]"
      v-if="isLoggedIn"
    >
      Portfolio
    </router-link>
    <a class="toggle-link px-4" href="https://analytics.embr.finance" target="_blank" title="This link will open a new window"
      >Price<svg width="24px" height="24px" viewBox="0 0 24 24" style="cursor:pointer"><g stroke-width="2.1" stroke="#666" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 13.5 17 19.5 5 19.5 5 7.5 11 7.5"></polyline><path d="M14,4.5 L20,4.5 L20,10.5 M20,4.5 L11,13.5"></path></g></svg></a
    >
  </div>
</template>

<script lang="ts">
import useFathom from '@/composables/useFathom';
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import useApp from '@/composables/useApp';
import useWeb3 from '@/services/web3/useWeb3';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import AppNavOtherItems from '@/embr/components/navs/AppNavOtherItems.vue';

export default defineComponent({
  name: 'AppNavToggle',
  components: {},
  props: {
    darkModeBg: { type: String, default: '800' }
  },

  setup() {
    const route = useRoute();
    const { appLoading } = useApp();
    const { account, isLoadingProfile } = useWeb3();
    const activeClasses = 'bg-black text-white dark:bg-gray-800';
    const isTradePage = computed(() => route.name === 'trade');
    const isFarmPage = computed(() => String(route.name).startsWith('farm'));
    const isEmbrPage = computed(() => route.name === 'embr');
    const isPortfolioPage = computed(() => route.name === 'my-portfolio');
    const isStakePage = computed(() => route.name === 'stake');
    const isInvestPage = computed(
      () => route.name === 'invest' || String(route.name).startsWith('pool')
    );
    const isHomePage = computed(
      () =>
        !isTradePage.value &&
        !isFarmPage.value &&
        !isEmbrPage.value &&
        !isInvestPage.value
    );
    const { trackGoal, Goals } = useFathom();

    const isLoggedIn = computed(
      () => !appLoading.value && !isLoadingProfile.value && !!account.value
    );

    return {
      isTradePage,
      activeClasses,
      trackGoal,
      Goals,
      isLoggedIn,
      isPortfolioPage,
      isStakePage,
      isInvestPage
    };
  }
});
</script>

<style scoped>
.app-nav-toggle {
  @apply h-12 flex items-center;
  font-variation-settings: 'wght' 600;
}

.toggle-link {
  @apply h-full flex items-center;
}
</style>
