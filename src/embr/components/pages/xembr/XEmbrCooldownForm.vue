<template>
  <BalForm ref="cooldownForm" @on-submit="submit">
    <div>
      <BalTextInput
        name="Cooldown"
        v-model="amount"
        v-model:isValid="validInput"
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
            @click.prevent="amount = userXembrBalance"
          >
            {{ $t('balance') }}:
            <BalLoadingBlock v-if="loading" class="h-4 w-24 ml-1" white />
            <span v-else>&nbsp;{{ userXembrBalance }}</span>
          </div>
        </template>
        <template v-slot:append>
          <div class="p-2">
            <BalBtn
              size="xs"
              color="white"
              @click.prevent="amount = userXembrBalance"
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
          Cooldown for withdraw
        </BalBtn>
      </template>
    </div>
  </BalForm>
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
      userXembrBalance,
      cooldown,
      XEmbrQuery
    } = useXEmbr();

    const { txListener } = useEthers();
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

    const embrDeposited = computed(() => {
      return userUnstakedEmbrBalance.value.toString();
    });

    async function submit(): Promise<void> {
      if (!data.cooldownForm.validate()) return;

      try {
        coolingdown.value = true;

        const amountScaled = scale(new BigNumber(amount.value), 18);
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

      Goals,
      TOKENS,
      // computed
      tokens,
      isWalletReady,
      toggleWalletSelectModal,
      isRequired,
      // methods
      submit,
      trackGoal,
      userXembrBalance
    };
  }
});
</script>
