<template>
  <BalCard>
    <div class="text-sm text-gray-200 font-medium mb-2">
      My Pending Rewards
    </div>
    <div class="text-xl font-medium truncate flex items-center">
      {{ fNum(pendingEmbr, 'token_fixed') }} EMBR
    </div>
    <div class="truncate flex items-center pb-8">
      {{ fNum(pendingEmbrValue, 'usd') }}
    </div>

    <BalBtn
      label="Harvest"
      block
      color="gradient"
      :disabled="pendingEmbr <= 0"
      :loading="harvesting"
      @click.prevent="harvestRewards"
    />
  </BalCard>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import useEthers from '@/composables/useEthers';
import useFarm from '@/embr/composables/farms/useFarm';
import useFarmUser from '@/embr/composables/farms/useFarmUser';

export default defineComponent({
  name: 'FarmHarvestRewardsCard',

  components: {},

  props: {
    pendingEmbr: {
      type: Number,
      required: true
    },
    pendingEmbrValue: {
      type: Number,
      required: true
    },
    farmId: {
      type: String,
      required: true
    },
    tokenAddress: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const { fNum } = useNumbers();
    const { txListener } = useEthers();
    const { harvest } = useFarm(ref(props.tokenAddress), ref(props.farmId));
    const harvesting = ref(false);
    const { farmUserRefetch } = useFarmUser(props.farmId);

    async function harvestRewards(): Promise<void> {
      harvesting.value = true;
      const tx = await harvest();

      if (!tx) {
        harvesting.value = false;
        return;
      }

      txListener(tx, {
        onTxConfirmed: async () => {
          await farmUserRefetch.value();
          harvesting.value = false;
        },
        onTxFailed: () => {
          harvesting.value = false;
        }
      });
    }

    return {
      fNum,
      harvestRewards,
      harvesting
    };
  }
});
</script>
