<template>
  <BalCard class="mb-4 pb-1">
    <div class="flex flex-col flex-grow">
      <h2 class="text-lg font-light mb-2">
        xEmbr Rewards
      </h2>
    </div>

    <BalLoadingBlock v-if="loading" class="h-64 w-128 mb-1" white />
    <div
      v-else
      v-for="(item) in rewardTokens"
      :key="item.index.toNumber()"
    >
      <div class="flex flex-col flex-grow">
        <div class="flex items-center space-x-4">
            <img :src="tokens[toChecksumAddress(item.address)].logoURI" width="36" />
            <div class="flex flex-col justify-center">
              <p  class="text-sm font-bold md:text-lg">
                  {{ tokens[toChecksumAddress(item.address)].name }}
              </p>
              <BalLoadingBlock v-if="xEmbrRewardLoading" class="h-4 w-24 ml-1" white />
              <p v-else class="text-sm md:text-base text-primary">Pending: {{ fNum(calcEarned(item.index, tokens[toChecksumAddress(item.address)].decimals).toString(), 'token') }}</p>
            </div>
        </div>
        <div class="pb-4">
          <BalLoadingBlock v-if="xEmbrRewardLoading" class="h-6 w-32 mr-2" white />
          <BalBtn
            v-else-if="calcEarned(item.index, tokens[toChecksumAddress(item.address)].decimals).gt(0)"
            color="transparent"
            flat
            :loading-label="loading ? 'Loading' : $t('confirming')"
            :loading="claiming[item.index.toNumber()] || loading"
            :size="'sm'"
            class="mr-2 text-base"
            :circle="false"
            @click.prevent="submit(item.index, tokens[toChecksumAddress(item.address)].name, tokens[toChecksumAddress(item.address)].decimals)"
          >
            <img
              src="~@/embr/assets/images/farmAPR.png"
              width="26"
              class="mr-2"
            /> Claim {{ tokens[toChecksumAddress(item.address)].symbol }}
            <img
              src="~@/embr/assets/images/farmAPR.png"
              width="26"
              class="ml-2"
            />
          </BalBtn>
        </div>
      </div>
    </div>
  </BalCard>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch
} from 'vue';
import { toChecksumAddress } from 'ethereumjs-util';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { useXEmbrReward } from '@/embr/composables/stake/useXEmbrReward';
import { useXEmbr } from '@/embr/composables/stake/useXEmbr';
import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/services/web3/useWeb3';
import useEthers from '@/composables/useEthers';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import BigNumber from 'bignumber.js';
import useTokens from '@/composables/useTokens';
import numeral from 'numeral';

type DataProps = {
  claiming: any
};

export default defineComponent({
  name: 'XEmbrRewards',

  components: {},

  emits: ['success'],

  props: {
    loading: {
      type: Boolean,
      required: true
    },
    rewardTokens: { 
      type: Array,
      required: true
    }
  },

  setup(props, { emit }) {
    const data = reactive<DataProps>({
      claiming: {} as any
    });

    const {
      isWalletReady,
      account,
      toggleWalletSelectModal,
      appNetworkConfig
    } = useWeb3();
    const { fNum } = useNumbers();

    const {
      XEmbrQuery,
      weightedTimestamp,
      refetch
    } = useXEmbr();

    const {
      xEmbrRewardLoading,
      globalData,
      userData,
      XEmbrRewardQuery,
      //currentExchangeRate,
      //embrPerShare,
      //avaxPerShare,
      claim,
      claimRedemption,
      earned
    } = useXEmbrReward();

    const { tokens } = useTokens();
    const { txListener } = useEthers();

    function calcEarned(index: BigNumber, decimals: number) {
      for (let i = 0; i < earned.value.length; i ++) { 
        if (earned.value[i].index.toString() === "115792089237316195423570985008687907853269984665640564039457584007913129639935" ) {
          return earned.value[i].amount.div(1e18)          
        }
        if (index.toNumber() === earned.value[i].index.toNumber()) return earned.value[index.toNumber()].amount.div(`1e` + decimals)
      }
      return new BigNumber(0);
    }


    async function submit(indexBig: BigNumber, name: string, decimals: number): Promise<void> {
      let index = indexBig.toNumber()
      if (!calcEarned(indexBig, decimals).gt(0)) return;

      data.claiming[index] = true;

      try {
        let tx
        if (indexBig.eq("115792089237316195423570985008687907853269984665640564039457584007913129639935")) {
          tx = await claimRedemption();
        } else { 
          tx = await claim(index.toString(), name);
        }
        
        if (!tx) {
          data.claiming[index] = false;
          return;
        }

        txListener(tx, {
          onTxConfirmed: async () => {
            await XEmbrQuery.refetch.value();
            await XEmbrRewardQuery.refetch.value();
            emit('success', tx);
            data.claiming[index] = false;
          },
          onTxFailed: () => {
            data.claiming[index] = false;
          }
        });
      } catch {
        data.claiming[index] = false;
      }

    }


    watch(account, () => {
      //
    });

    onMounted(() => {
      //
    });

    return {
      // data
      ...toRefs(data),
      appNetworkConfig,
      isWalletReady,
      toggleWalletSelectModal,
      tokens,
      xEmbrRewardLoading,
      toChecksumAddress,
      // methods
      calcEarned,
      submit,
      fNum
    };


  }
})

</script>
