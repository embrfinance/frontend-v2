<template>
  <div class="ml-2 flex-1 mt-4 center-text-container">
    <div class="mb-2">
      <span class="text-sm font-bold md:text-lg"><p>Finish withdrawing</p></span>
    </div>
    <div class="mt-4">
      <span><p><span class="text-sm font-bold md:text-lg">Withdraw window</span><br/> {{ withdrawWindowRemaining }} </p></span>
    </div>
    <div class="p-2 ml-4 mr-4">
      <div>
        <BalBtn
          size="xs"
          color="white"
          @click.prevent="endWithdrawCooldown"
        >
          {{ $t('endcooldown') }}
        </BalBtn>
      </div>
      <div>
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="sm" class="text-gray-400 -mb-px" />
          </template>
          <div v-html="$t('endcooldownDetails')" class="w-52" />
        </BalTooltip>
      </div>
    </div>
  </div>
  <div class="ml-4">
    <BalForm ref="withdrawForm" @on-submit="submit">
      <div>
        <BalTextInput
          name="Withdraw"
          v-model="amount"
          v-model:isValid="validInput"
          :disabled="withdrawing"
          :rules="amountRules()"
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
              @click.prevent="amount = cooldownUnits.toString()"
            >
              {{ $t('balance') }}:
              <BalLoadingBlock v-if="loading" class="h-4 w-24 ml-1" white />
              <span v-else>&nbsp;{{ cooldownUnits }}</span>
            </div>
          </template>
          <template v-slot:append>
            <div class="p-2">
              <BalBtn
                size="xs"
                color="white"
                @click.prevent="amount = cooldownUnits.toString()"
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
            :loading="withdrawing || loading"
            block
          >
            Withdraw EMBR
          </BalBtn>
          <div class="ml-4 pl-4">
            <BalCheckbox
              v-if="!isMaxWithdraw"
              v-model="endWDCooldown"
              name="endCooldown"
              size="sm"
              :label="$t('endcooldownToggle')"
            />
          </div>
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
import { BigNumber } from 'bignumber.js';
import useEthers from '@/composables/useEthers';
import { useXEmbr } from '@/embr/composables/stake/useXEmbr';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';

type DataProps = {
  withdrawForm: FormRef;
  amount: string;
  endWDCooldown: boolean;
  propMax: string[];
  validInput: boolean;
  propToken: number;
};
export default defineComponent({
  name: 'XEmbrWithdrawForm',
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
      withdrawForm: {} as FormRef,
      amount: '',
      propMax: [],
      endWDCooldown: false,
      validInput: true,
      propToken: 0
    });

    const {
      userUnstakedEmbrBalance,
      userXembrBalance,
      withdraw,
      XEmbrQuery,
      cooldownUnits,
      cooldownTimestamp,
      unstakeWindow,
      cooldownPeriod,
      endCooldown
    } = useXEmbr();

    const { txListener } = useEthers();
    const {
      isWalletReady,
      account,
      toggleWalletSelectModal,
      appNetworkConfig
    } = useWeb3();
    const withdrawing = ref(false);
    const { t } = useI18n();
    const { tokens } = useTokens();
    const { trackGoal, Goals } = useFathom();
    const { amount, endWDCooldown } = toRefs(data);
    const { refetchBalances } = useTokens();

    function amountRules() {
      return isWalletReady.value
        ? [
            isPositive(),
            isLessThanOrEqualTo(cooldownUnits.value.toString(), t('exceedsBalance'))
          ]
        : [isPositive()];
    }

    const isMaxWithdraw = computed(() => { 
        const amt = new BigNumber(data.amount)
        if (amt.eq(cooldownUnits.value)) { 
          return true
        }
        return false
    })

    const withdrawWindowRemaining = computed(() => {

        const currentTime = new BigNumber(Date.now()/ 1000)
        const totalTime = cooldownTimestamp.value.plus(cooldownPeriod.value)
        if (currentTime.gt(totalTime)) { 
          return new BigNumber(0)
        }

        return timeConversion(totalTime.minus(currentTime).times(1000))
    })
    
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

    async function endWithdrawCooldown(): Promise<void> { 
      try {
        withdrawing.value = true;

        const tx = await endCooldown();
        if (!tx) {
          withdrawing.value = false;
          data.endWDCooldown = false
          return;
        }

        txListener(tx, {
          onTxConfirmed: async () => {
            emit('success', tx);
            amount.value = '';
            await XEmbrQuery.refetch.value();
            withdrawing.value = false;
            data.endWDCooldown = false
          },
          onTxFailed: () => {
            withdrawing.value = false;
            data.endWDCooldown = false
          }
        });
      } catch {
        withdrawing.value = false;
        data.endWDCooldown = false
      }
    }

    async function submit(): Promise<void> {
      if (!data.withdrawForm.validate()) return;

      try {
        withdrawing.value = true;

        const amt = new BigNumber(amount.value)
        const amountScaled = scale(amt, 18);
        const endCool = amt.eq(cooldownUnits.value) ? true : endWDCooldown.value
        const tx = await withdraw(amountScaled.toString(), account.value, endCool);

        if (!tx) {
          withdrawing.value = false;
          data.endWDCooldown = false
          return;
        }

        txListener(tx, {
          onTxConfirmed: async () => {
            emit('success', tx);
            amount.value = '';
            await XEmbrQuery.refetch.value();
            withdrawing.value = false;
            data.endWDCooldown = false
          },
          onTxFailed: () => {
            withdrawing.value = false;
            data.endWDCooldown = false
          }
        });
      } catch {
        withdrawing.value = false;
        data.endWDCooldown = false
      }
    }

    watch(isWalletReady, isAuth => {
      if (!isAuth) {
        data.amount = '0';
        data.propMax = [];
        data.endWDCooldown = false;
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
      withdrawing,

      Goals,
      TOKENS,
      // computed
      withdrawWindowRemaining,
      tokens,
      isWalletReady,
      toggleWalletSelectModal,
      isRequired,
      isMaxWithdraw,
      endWithdrawCooldown,
      // methods
      
      submit,
      trackGoal,
      amountRules,
      cooldownUnits,
      userXembrBalance
    };
  }
});
</script>
<style scoped>
.center-text-container {
  text-align: center;
}
</style>
