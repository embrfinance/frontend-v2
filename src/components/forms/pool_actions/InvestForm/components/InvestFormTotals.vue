<script setup lang="ts">
import { computed, toRefs } from 'vue';
import useNumbers from '@/composables/useNumbers';
import { InvestMathResponse } from '../composables/useInvestMath';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
type Props = {
  math: InvestMathResponse;
};

/**
 * Props
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'maximize'): void;
  (e: 'optimize'): void;
}>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
const { isWalletReady } = useWeb3();

const {
  fiatTotal,
  hasNoBalances,
  hasAllTokens,
  priceImpact,
  highPriceImpact,
  maximized,
  optimized,
  batchSwapLoading,
  supportsPropotionalOptimization
} = toRefs(props.math);

/**
 * COMPUTED
 */
const priceImpactClasses = computed(() => ({
  'bg-red-500 text-white divide-red-400': highPriceImpact.value
}));

const optimizeBtnClasses = computed(() => ({
  'text-gradient': !highPriceImpact.value,
  'text-red-500 px-2 py-1 bg-white rounded-lg': highPriceImpact.value
}));
</script>

<template>
  <div class="data-table">
    <div class="data-table-row total-row">
      <div class="p-2">{{ $t('total') }}</div>
      <div class="data-table-number-col">
        {{ fNum(fiatTotal, 'usd') }}
        <div v-if="isWalletReady && !hasNoBalances" class="text-sm">
          <span v-if="maximized" class="text-green-600 dark:text-green-700">
            <button style="font-size: small !important; border:1px solid black !important;">&nbsp;{{ $t('maxed') }}&nbsp;</button>
          </span>
          <span
            v-else
            class="text-white cursor-pointer"
            @click="emit('maximize')"
          >
            <button style="font-size: small !important; border:1px solid black !important;">&nbsp;{{ $t('max') }}&nbsp;</button>
          </span>
        </div>
      </div>
    </div>
    <div :class="['data-table-row price-impact-row', priceImpactClasses]">
      <div class="p-2">{{ $t('priceImpact') }}</div>
      <div class="data-table-number-col">
        <div class="flex">
          <span v-if="!batchSwapLoading">
            {{ fNum(priceImpact, 'percent') }}
          </span>
          <BalLoadingBlock v-else class="w-10" />
          <BalTooltip :text="$t('customAmountsTip')">
            <template v-slot:activator>
              <BalIcon
                v-if="highPriceImpact"
                name="alert-triangle"
                size="xs"
                class="-mb-px ml-1"
              />
              <BalIcon
                v-else
                name="info"
                size="xs"
                class="text-gray-400 -mb-px ml-1"
              />
            </template>
          </BalTooltip>
        </div>

        <div v-if="isWalletReady && hasAllTokens && supportsPropotionalOptimization" class="text-sm font-semibold">
          <span v-if="optimized" class="text-green-600 dark:text-green-700">
            ✔️&nbsp;<button style="font-size: small !important; border:1px solid black !important;">&nbsp;{{ $t('optimized') }}&nbsp;</button>
        </span>

          <div
          style="width:--webkit-fill-available;"
            v-else
            :class="(['cursor-pointer', optimizeBtnClasses], optimizer)"
            @click="emit('optimize')"
          >
          <span style="align-self: flex-start; float:left; width:auto;">
            <span class="round">
              <span id="cta">
                <span style="filter: drop-shadow(0px 0px 3px red);" class="arrow primera next "></span>
                <span style="filter: drop-shadow(0px 0px 3px orange);" class="arrow segunda next "></span>
              </span>
            </span>
            <b style="color:gold;">Fix Value Loss</b>
            <span class="round">
              <span id="cta">
                <span style="filter: drop-shadow(0px 0px 3px yellow);" class="arrow primera next "></span>
                <span style="filter: drop-shadow(0px 0px 3px lawngreen);" class="arrow segunda next "></span>
              </span>
            </span>
          </span>
          <button style="font-size: small !important; border:1px solid black !important;">&nbsp;{{ $t('optimize') }}&nbsp;</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-table {
  @apply border dark:border-gray-900 rounded-lg divide-y dark:divide-gray-900;
}

.data-table-row {
  @apply grid grid-cols-4 items-center;
  @apply divide-x dark:divide-gray-900;
  @apply dark:bg-gray-800;
}

.data-table-number-col {
  @apply col-span-3 p-2 flex items-center justify-between;
}

.total-row {
  @apply text-lg font-bold rounded-t-lg;
}

.price-impact-row {
  @apply text-sm rounded-b-lg;
}

.optimizer {
  @apply hover:text-green-100;
}




.round {

    display: inline-flex;
    border: none;
    width: 30px;
    height: inherit;
    border-radius: 100%;
    position: relative;
    inset: auto auto 0px 0px;
    margin: 0px;
    top: 0px;
}

#cta{
    width:100%; cursor: pointer; position: absolute;
}

#cta .arrow{left: 30%;}
.arrow {position: absolute; top: -0.8em;  margin-left:0px; width: 12px; height: 12px; background-size: contain;}
.segunda{margin-left: 8px;}
.next {
	background-image: url(data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHN0eWxlPi5zdDB7ZmlsbDojZmZmfTwvc3R5bGU+PHBhdGggY2xhc3M9InN0MCIgZD0iTTMxOS4xIDIxN2MyMC4yIDIwLjIgMTkuOSA1My4yLS42IDczLjdzLTUzLjUgMjAuOC03My43LjZsLTE5MC0xOTBjLTIwLjEtMjAuMi0xOS44LTUzLjIuNy03My43UzEwOSA2LjggMTI5LjEgMjdsMTkwIDE5MHoiLz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzE5LjEgMjkwLjVjMjAuMi0yMC4yIDE5LjktNTMuMi0uNi03My43cy01My41LTIwLjgtNzMuNy0uNmwtMTkwIDE5MGMtMjAuMiAyMC4yLTE5LjkgNTMuMi42IDczLjdzNTMuNSAyMC44IDczLjcuNmwxOTAtMTkweiIvPjwvc3ZnPg==);
}

@keyframes bounceAlpha {
  0% {opacity: 1; transform: translateX(0px) scale(1);}
  25%{opacity: 0; transform:translateX(10px) scale(0.9);}
  26%{opacity: 0; transform:translateX(-10px) scale(0.9);}
  55% {opacity: 1; transform: translateX(0px) scale(1);}
}

.bounceAlpha {
    animation-name: bounceAlpha;
    animation-duration:1.4s;
    animation-iteration-count:infinite;
    animation-timing-function:linear;
}

.arrow.primera.bounceAlpha {
    animation-name: bounceAlpha;
    animation-duration:1.4s;
    animation-delay:0.2s;
    animation-iteration-count:infinite;
    animation-timing-function:linear;
}

.round .arrow{
    animation-name: bounceAlpha;
    animation-duration:1.4s;
    animation-iteration-count:infinite;
    animation-timing-function:linear;
}
.round .arrow.primera{
    animation-name: bounceAlpha;
    animation-duration:1.4s;
    animation-delay:0.2s;
    animation-iteration-count:infinite;
    animation-timing-function:linear;
}




</style>
