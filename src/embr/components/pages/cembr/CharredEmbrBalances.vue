<script setup lang="ts">
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { useCharredEmbr } from '@/embr/composables/stake/useCharredEmbr';
import useNumbers from '@/composables/useNumbers';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import numeral from 'numeral';

type Props = {
  loading: boolean;
  cEmbrBalance: string;
  bptBalance: string;
  embrBalance: string;
};

const props = defineProps<Props>();

const { fNum } = useNumbers();

const {
  userStakedFtmBalance,
  userStakedEmbrBalance,
  userStakedBptBalance,
  userCembrBalance,
  currentExchangeRate,
  embrPerShare,
  embrPerShare,
  cEmbrLoading
} = useCharredEmbr();

/**
 * STATE
 */
</script>

<template>
  <BalCard class="mb-4">
    <div class="text-sm text-gray-500 font-medium mb-4">
      Exchange Rate
    </div>
    <div
      class="border-green-500 bg-green-900 border-2 rounded-xl px-3 py-1 text-center justify-center mb-2 flex items-center text-sm"
    >
      1 cEMBR =
      <BalLoadingBlock v-if="cEmbrLoading" class="h-5 w-4 mx-0.5" white />{{
        !cEmbrLoading ? fNum(currentExchangeRate, 'token') : ''
      }}
      BPT
    </div>
    <div
      class="border-red-500 bg-red-900 border-2 rounded-xl px-3 py-1 text-center justify-center flex items-center text-sm"
    >
      1 BPT =
      <BalLoadingBlock v-if="cEmbrLoading" class="h-5 w-4 mx-0.5" white />{{
        !cEmbrLoading ? numeral(embrPerShare).format('0.[00]') : ''
      }}
      Embr /
      <BalLoadingBlock v-if="cEmbrLoading" class="h-5 w-4 mx-0.5" white />{{
        !cEmbrLoading ? numeral(embrPerShare).format('0.[00]') : ''
      }}
      FTM
    </div>
  </BalCard>
  <BalCard class="mb-4 pb-1">
    <div class="flex flex-col flex-grow">
      <div class="text-sm text-gray-500 font-medium mb-3">
        My Stake
      </div>
      <div class="flex items-center space-x-4">
        <img src="~@/embr/assets/images/cEMBR.png" width="52" />
        <div class="flex flex-col justify-center">
          <BalLoadingBlock v-if="props.loading" class="h-6 w-24 mb-1" white />
          <p v-else class="text-sm font-bold md:text-lg">
            {{ fNum(userCembrBalance.toString(), 'token') }}
          </p>
          <p class="text-sm md:text-base text-primary">cEMBR</p>
        </div>
      </div>
    </div>
    <div class="flex items-center my-5">
      <div class="h-1 w-full flex-1 bg-gray-700 rounded-3xl" />
      <div class="text-gray-500 mx-2">OR</div>
      <div class="h-1 w-full flex-1 bg-gray-700 rounded-3xl" />
    </div>
    <div class="flex flex-col flex-grow">
      <div class="flex items-center space-x-4">
        <img src="~@/embr/assets/images/fidellio-duetto-bpt.png" width="52" />
        <div class="flex flex-col justify-center">
          <BalLoadingBlock v-if="props.loading" class="h-6 w-24 mb-1" white />
          <p v-else class="text-sm font-bold md:text-lg">
            {{ fNum(userStakedBptBalance.toString(), 'token') }}
          </p>
          <p class="text-sm md:text-base text-primary">
            Fidelio Duetto BPTs
          </p>
        </div>
      </div>
    </div>

    <div class="flex items-center my-5">
      <div class="h-1 w-full flex-1 bg-gray-700 rounded-3xl" />
      <div class="text-gray-500 mx-2">OR</div>
      <div class="h-1 w-full flex-1 bg-gray-700 rounded-3xl" />
    </div>
    <div class="flex flex-col flex-grow">
      <div class="flex items-center space-x-4">
        <img src="~@/embr/assets/images/embr-icon-large.png" width="52" />
        <div class="flex flex-col justify-center">
          <BalLoadingBlock v-if="props.loading" class="h-6 w-24 mb-1" white />
          <p v-else class="text-sm font-bold md:text-lg">
            {{ fNum(userStakedEmbrBalance.toString(), 'token') }}
          </p>
          <p class="text-sm md:text-base text-primary">
            Embr
          </p>
        </div>
      </div>
    </div>
    <div class="flex flex-col flex-grow mt-4">
      <div class="flex items-center space-x-4">
        <img
          src="https://storageapi.fleek.co/embrfinance-team-bucket/FTM.png"
          width="52"
        />
        <div class="flex flex-col justify-center">
          <BalLoadingBlock v-if="props.loading" class="h-6 w-24 mb-1" white />
          <p v-else class="text-sm font-bold md:text-lg">
            {{ fNum(userStakedFtmBalance.toString(), 'token') }}
          </p>
          <p class="text-sm md:text-base text-primary">
            FTM
          </p>
        </div>
      </div>
    </div>
  </BalCard>
</template>
