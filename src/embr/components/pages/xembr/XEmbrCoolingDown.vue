<template>
  <div class="ml-4 flex-1 mt-4 center-text-container">
    <div class="">
      <span><p><span class="text-sm font-bold md:text-lg">Currently cooling</span><br/> {{ cooldownUnits }} EMBR</p></span>
    </div>
    <div class="mt-4">
      <span><p><span class="text-sm font-bold md:text-lg">Wait Remaining</span><br/>  {{ timeRemaining }}</p></span>
    </div>
  </div>
  <div class="ml-4">
    <BalForm ref="cooldownForm" @on-submit="submit">
      <div>
        <BalTextInput
          name="Cooldown"
          v-model="amount"
          v-model:isValid="validInput"
          :rules="amountRules()"
          :disabled="coolingdown"
          type="number"
          min="0"
          step="any"
          placeholder="0"
          :decimal-limit="18"
          validate-on="input"
          prepend-border
          append-shadow
        >
          <template v-slot:info>
            <div
              class="cursor-pointer flex"
              @click.prevent="amount = userStakedEmbrBalance"
            >
              {{ $t('balance') }}:
              <BalLoadingBlock v-if="loading" class="h-4 w-24 ml-1" white />
              <span v-else>&nbsp;{{ userStakedEmbrBalance }}</span>
            </div>
          </template>
          <template v-slot:append>
            <div class="p-2">
              <BalBtn
                size="xs"
                color="white"
                @click.prevent="amount = userStakedEmbrBalance"
              >
                {{ $t('max') }}
              </BalBtn>
            </div>
          </template>
        </BalTextInput>
      </div>

      <div class="pt-4">
        <BalBtn
          v-if="!isWalletReady"
          :label="$t('connectWallet')"
          block
          @click.prevent="toggleWalletSelectModal"
        />
        <template v-else>
          <BalBtn
            type="submit"
            :loading-label="loading ? 'Loading' : $t('confirming')"
            color="gradient"
            :disabled="!validInput || amount === '0' || amount === ''"
            :loading="coolingdown || loading"
            block
          >
            Increase cooldown amount
          </BalBtn>
        </template>
      </div>
    </BalForm>
  </div>
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
import { FormRef } from '@/types';
import {
  isLessThanOrEqualTo,
  isPositive,
  isRequired
} from '@/lib/utils/validations';
import { useI18n } from 'vue-i18n';
import { scale, scaleDown, sleep } from '@/lib/utils';
import useFathom from '@/composables/useFathom';

import { TOKENS } from '@/constants/tokens';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import useNumbers from '@/composables/useNumbers';
import { BigNumber } from 'bignumber.js';
import useEthers from '@/composables/useEthers';
import { useXEmbr } from '@/embr/composables/stake/useXEmbr';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';

type DataProps = {
  cooldownForm: FormRef;
  amount: string;
  propMax: string[];
  validInput: boolean;
  propToken: number;
};
export default defineComponent({
  name: 'XEmbrCooldownForm',
  components: {},
  emits: ['success'],

  props: {
    loading: {
      type: Boolean,
      required: true
    }
  },

  setup(props, { emit }) {
    const data = reactive<DataProps>({
      cooldownForm: {} as FormRef,
      amount: '',
      propMax: [],
      validInput: true,
      propToken: 0
    });

    const {
      userUnstakedEmbrBalance,
      weightedTimestamp,
      userStakedEmbrBalance,
      cooldownUnits,
      cooldownTimestamp,
      cooldown,
      XEmbrQuery
    } = useXEmbr();

    const { txListener } = useEthers();
    const { fNum } = useNumbers();
    const {
      isWalletReady,
      account,
      toggleWalletSelectModal,
      appNetworkConfig
    } = useWeb3();
    const coolingdown = ref(false);
    const { t } = useI18n();
    const { tokens } = useTokens();
    const { trackGoal, Goals } = useFathom();
    const { amount } = toRefs(data);
    const { refetchBalances } = useTokens();

    function amountRules() {
      return isWalletReady.value
        ? [
            isPositive(),
            isLessThanOrEqualTo(userStakedEmbrBalance.value.toString(), t('exceedsBalance'))
          ]
        : [isPositive()];
    }

    const embrDeposited = computed(() => {
      return userUnstakedEmbrBalance.value.toString();
    });

    async function submit(): Promise<void> {
      if (!data.cooldownForm.validate()) return;

      try {
        coolingdown.value = true;

        const amountScaled = scale(new BigNumber(amount.value).plus(cooldownUnits.value), 18);
        const tx = await cooldown(amountScaled.toString());

        if (!tx) {
          coolingdown.value = false;
          return;
        }

        txListener(tx, {
          onTxConfirmed: async () => {
            emit('success', tx);
            amount.value = '';
            await XEmbrQuery.refetch.value();
            coolingdown.value = false;
          },
          onTxFailed: () => {
            coolingdown.value = false;
          }
        });
      } catch {
        coolingdown.value = false;
      }
    }


    function calcPaperHandsFeePercent() { 
      const currentTimestamp = new BigNumber(Math.floor(Date.now() / 1000))
      const weeksStaked = currentTimestamp.minus(weightedTimestamp.value).times(1e18).div(604800)
      let feeRate: BigNumber
      if (weeksStaked.gt(3e18)) {
        feeRate = new BigNumber(300e36).div(weeksStaked).sqrt().times(1e7)
        feeRate = feeRate.lt(25e15) ? new BigNumber(0) : feeRate.minus(25e15);
      } else { 
        feeRate = new BigNumber(75e15);
      }
      return feeRate.div(1e16)
    }

    const timeRemaining = computed(() => {
        const currentTime = new BigNumber(Date.now()/ 1000)
       return timeConversion(cooldownTimestamp.value.plus(604800).minus(currentTime).times(1000))
    });


    function calcPaperHandsFeeValue() { 
      const amt = new BigNumber(data.amount).gt(0) ? new BigNumber(data.amount) : userStakedEmbrBalance.value
      return amt.times(calcPaperHandsFeePercent().div(100))
    }

    function timeConversion(millisec) {

        var seconds = (millisec / 1000).toFixed(1);

        var minutes = (millisec / (1000 * 60)).toFixed(1);

        var hours = (millisec / (1000 * 60 * 60)).toFixed(1);

        var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

        if (parseInt(seconds) < 60) {
            return seconds + " Sec";
        } else if (parseInt(minutes) < 60) {
            return minutes + " Min";
        } else if (parseInt(hours) < 24) {
            return hours + " Hrs";
        } else {
            return days + " Days"
        }
    }

    watch(isWalletReady, isAuth => {
      if (!isAuth) {
        data.amount = '0';
        data.propMax = [];
      }
    });

    watch(account, () => {
      //
    });

    onMounted(() => {
      //
    });

    return {
      // data
      ...toRefs(data),
      coolingdown,
      cooldownUnits,
      timeRemaining,

      Goals,
      TOKENS,
      // computed
      tokens,
      isWalletReady,
      toggleWalletSelectModal,
      isRequired,
      fNum,
      calcPaperHandsFeePercent,
      calcPaperHandsFeeValue,
      amountRules,
      // methods
      submit,
      trackGoal,
      userStakedEmbrBalance
    };
  }
});
</script>

<style scoped>
.center-text-container {
  text-align: center;
}
</style>