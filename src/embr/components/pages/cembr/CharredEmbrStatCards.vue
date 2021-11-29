<script setup lang="ts">
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import CharredEmbrAprTooltip from '@/embr/components/pages/cembr/CharredEmbrAprTooltip.vue';
import FarmHarvestRewardsCard from '@/embr/components/pages/farm/FarmHarvestRewardsCard.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { useCharredEmbr } from '@/embr/composables/stake/useCharredEmbr';
import useNumbers from '@/composables/useNumbers';
import { computed } from 'vue';
import FarmStatCardsLoading from '@/embr/components/pages/farm/FarmStatCardsLoading.vue';

const { appNetworkConfig } = useWeb3();
const { fNum } = useNumbers();

const {
  cembrDecoratedFarm,
  totalBptStaked,
  totalSupply,
  totalEmbrStaked,
  pool,
  cEmbrLoading,
  swapApr,
  farmApr,
  cembrApr,
  totalApr
} = useCharredEmbr();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
    <template v-if="cEmbrLoading">
      <BalLoadingBlock v-for="n in 4" :key="n" class="h-24" />
    </template>
    <template v-else>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          TVL
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(cembrDecoratedFarm?.tvl || '0', 'usd') }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          cEMBR Minted
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(totalSupply?.toString() || '0', 'token_lg') }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          Embr Staked
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(totalEmbrStaked, 'token_lg') }}
        </div>
      </BalCard>

      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          APR
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(totalApr || '0', 'percent') }}
          <CharredEmbrAprTooltip
            :swap-apr="swapApr"
            :farm-apr="farmApr"
            :cembr-apr="cembrApr"
          />
        </div>
      </BalCard>
    </template>
    <!--    </template>-->
  </div>
  <h4 class="px-4 lg:px-0 mb-4">Fresh Embr Farm</h4>
  <FarmStatCardsLoading v-if="cEmbrLoading" />
  <div v-else class="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          Farm TVL
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(cembrDecoratedFarm?.tvl || '0', 'usd') }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          Embr
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(cembrDecoratedFarm?.rewards || '0', 'token_lg') }} / day
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          My balance
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(cembrDecoratedFarm?.stake || '0', 'usd') }}
        </div>
      </BalCard>
      <BalCard>
        <div class="text-sm text-gray-500 font-medium mb-2">
          My share
        </div>
        <div class="text-xl font-medium truncate flex items-center">
          {{ fNum(cembrDecoratedFarm?.share || '0', 'percent') }}
        </div>
      </BalCard>
    </div>
    <FarmHarvestRewardsCard
      :farm-id="appNetworkConfig.cEmbr.farmId"
      :token-address="appNetworkConfig.cEmbr.poolAddress"
      :pending-embr="cembrDecoratedFarm?.pendingEmbr || 0"
      :pending-embr-value="cembrDecoratedFarm?.pendingEmbrValue || 0"
      :pending-reward-token-value="0"
      :pending-reward-token="0"
    />
  </div>
</template>
