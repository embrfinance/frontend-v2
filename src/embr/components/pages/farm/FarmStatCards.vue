<template>
  <div class="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
      <BalCard v-for="(stat, i) in stats" :key="i">
        <div class="text-sm text-gray-200 font-medium mb-2">
          {{ stat.label }}
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ stat.value }}
          <LiquidityAPRTooltip :pool="pool" v-if="stat.id === 'apr'" />
        </div>
      </BalCard>
    </div>
    <FarmHarvestRewardsCard
      :farm-id="pool.farm.id"
      :token-address="pool.address"
      :pending-embr="pool.farm.pendingEmbr"
      :pending-embr-value="pool.farm.pendingEmbrValue"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import LiquidityAPRTooltip from '@/components/tooltips/LiquidityAPRTooltip.vue';
import useEthers from '@/composables/useEthers';
import {
  DecoratedFarm,
  DecoratedPoolWithFarm,
  DecoratedPoolWithRequiredFarm
} from '@/embr/services/subgraph/subgraph-types';
import useFarm from '@/embr/composables/farms/useFarm';
import useFarmUserQuery from '@/embr/composables/farms/useFarmUserQuery';
import FarmHarvestRewardsCard from '@/embr/components/pages/farm/FarmHarvestRewardsCard.vue';
import { DecoratedPool } from '@/services/balancer/subgraph/types';

export default defineComponent({
  components: {
    FarmHarvestRewardsCard,
    LiquidityAPRTooltip
  },

  props: {
    pool: {
      type: Object as PropType<DecoratedPoolWithRequiredFarm>,
      required: true
    }
  },

  setup(props) {
    const { fNum } = useNumbers();
    const { txListener } = useEthers();
    const { harvest } = useFarm(
      ref(props.pool.address),
      ref(props.pool.decoratedFarm.id)
    );
    const harvesting = ref(false);
    const farmUserQuery = useFarmUserQuery(props.pool.decoratedFarm.id);
    const farmUser = computed(() => farmUserQuery.data.value);

    async function harvestRewards(): Promise<void> {
      harvesting.value = true;
      const tx = await harvest();

      if (!tx) {
        harvesting.value = false;
        return;
      }

      txListener(tx, {
        onTxConfirmed: async () => {
          await farmUserQuery.refetch.value();
          harvesting.value = false;
        },
        onTxFailed: () => {
          harvesting.value = false;
        }
      });
    }

    // COMPUTED
    const stats = computed(() => {
      const farm = props.pool.decoratedFarm;
      const items = [
        {
          id: 'tvl',
          label: 'TVL',
          value: fNum(farm.tvl, 'usd')
        }
      ];

      items.push({
        id: 'embr',
        label: 'EMBR',
        value: `${fNum(farm.rewards, 'token_lg')} / day`
      });

      items.push({
        id: 'stake',
        label: 'My Balance',
        value: fNum(farm.stake, 'usd')
      });

      items.push({
        id: 'your_share',
        label: 'My Share',
        value: fNum(farm.share, 'percent')
      });

      return items;
    });

    const pendingRewards = computed(() => {
      return {
        count: farmUser.value?.pendingEmbr || 0,
        value: farmUser.value?.pendingEmbrValue || 0
      };
    });

    return {
      stats,
      pendingRewards,
      fNum,
      harvestRewards,
      harvesting
    };
  }
});
</script>
