<script lang="ts" setup>
import { computed, ref } from 'vue';

import useWeb3 from '@/services/web3/useWeb3';
import useNumbers from '@/composables/useNumbers';
import usePoolCreation from '@/composables/pools/usePoolCreation';

import {
  isValidPoolName,
  isRequired,
  maxChar,
  isPoolNameCheck,
  isSymbolNameCheck,
  isSymbol
} from '@/lib/utils/validations';

import { isAddress } from 'ethers/lib/utils';

/**
 * STATIC
 */
const POOL_PREFIX = ['EPT'];

/**
 * STATE
 */
//const isCustomFee = ref(false);
//const checkboxState = ref(true);
const isInvalidName = ref(false);
const isInvalidSymbol = ref(false);

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
const {
  symbol,
  name,
  proceed,
  goBack,
  isLoadingSimilarPools
} = usePoolCreation();
const { account } = useWeb3();
const { userNetworkConfig } = useWeb3();

/**
 * COMPUTED
 */

const isProceedDisabled = computed(() => {
  if (
    !name.value ||
    !isPoolNameCheck(name.value) ||
    !symbol.value ||
    !isSymbolNameCheck(symbol.value)
  ) {
    return true;
  }

  return false;
});

// this does not need to be computed as it relies on a static
/*const feeOptions = FIXED_FEE_OPTIONS.map(option => {
  return {
    label: fNum(option, null, { format: '0.0%' }),
    value: option
  };
});*/

/**
 * FUNCTIONS
 */
function onNameInput(val: string): void {
  name.value = val;
  isInvalidName.value = false;
}

function onSymbolInput(): void {
  symbol.value = symbol.value.toUpperCase();
  isInvalidSymbol.value = false;
}
</script>

<template>
  <BalCard>
    <BalStack vertical>
      <BalStack vertical spacing="xs">
        <span class="text-xs text-gray-700 dark:text-gray-200">{{
          userNetworkConfig?.name
        }}</span>
        <BalStack horizontal align="center" spacing="xs">
          <button
            @click="goBack"
            class="text-blue-500 hover:text-blue-700 flex"
          >
            <BalIcon class="flex" name="chevron-left" />
          </button>
          <h5 class="font-bold dark:text-gray-300">
            {{ $t('createAPool.setPoolNameOrSymbol') }}
          </h5>
        </BalStack>
      </BalStack>
      <BalStack vertical spacing="xs">
        <h6>{{ $t('createAPool.poolNameTitle') }}</h6>
        <p class="text-gray-600 mb-1">
          {{ $t('createAPool.poolNameInfo') }}
        </p>
        <BalStack vertical spacing="xs">
          <BalTextInput
            v-model="name"
            placeholder="Enter Pool Name Here"
            type="text"
            size="sm"
            validateOn="blur"
            :rules="[isRequired($t('A pool name')), isValidPoolName()]"
            name="poolName"
            @input="onNameInput"
          />
        </BalStack>
      </BalStack>
      <BalStack vertical spacing="xs">
        <h6>{{ $t('createAPool.symbolNameTitle') }}</h6>
        <p class="text-gray-600 mb-1">
          {{ $t('createAPool.symbolNameInfo') }}
        </p>
        <BalStack vertical spacing="xs">
          <BalTextInput
            v-model="symbol"
            placeholder="Enter Pool Sympol Here"
            type="text"
            size="sm"
            validateOn="blur"
            :rules="[isRequired($t('A pool symbol')), maxChar(7), isSymbol()]"
            name="symbolName"
            @keydown="onSymbolInput"
            @keyup="onSymbolInput"
          >
            <template v-slot:prepend>
              <div style="padding-top:4px;">
                EPT-
              </div>
            </template>
          </BalTextInput>
        </BalStack>
      </BalStack>
      <BalBtn
        :disabled="isProceedDisabled || isLoadingSimilarPools"
        type="submit"
        block
        color="gradient"
        @click="proceed"
        >{{ $t('next') }}</BalBtn
      >
    </BalStack>
  </BalCard>
</template>

<style scoped>
.custom-input {
  @apply flex items-center px-1 rounded-lg shadow-inner h-full;
}
</style>
