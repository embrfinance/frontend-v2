<template>
  <BalForm ref="depositForm" @on-submit="submit">
    <div>
        <div class="ml-3 flex-1 text-center">
          <span>Update your timestamp to apply multipliers</span>
        </div>
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
            :loading="reviewing || loading"
            block
            @click.prevent="submit"
        >
        Update your timestamp
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
import useNumbers from '@/composables/useNumbers';
import { scale, scaleDown, sleep } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';
import useEthers from '@/composables/useEthers';
import BigNumber from 'bignumber.js';
import { useXEmbr } from '@/embr/composables/stake/useXEmbr';
import useAllowanceAvailableQuery from '@/embr/composables/farms/useAllowanceAvailableQuery';
import { governanceContractsService } from '@/embr/services/governance/governance-contracts.service';
import useTokens from '@/composables/useTokens';

type DataProps = {
  depositForm: FormRef;
};

export default defineComponent({
  name: 'XEmbrDepositForm',

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
      depositForm: {} as FormRef,
    });

    const {
      isWalletReady,
      account,
      toggleWalletSelectModal,
      appNetworkConfig
    } = useWeb3();
    const {
      reviewTimestamp,
      XEmbrQuery
    } = useXEmbr();
    const { refetchAllowances } = useTokens();

    const reviewing = ref(false);
    const { txListener } = useEthers();

    async function submit(): Promise<void> {
      if (!data.depositForm.validate()) return;

      reviewing.value = true;
      try {
          console.log("xploited reviewTimestamp!", account.value)
        const tx = await reviewTimestamp(account.value);

        if (!tx) {
          reviewing.value = false;
          return;
        }

        txListener(tx, {
          onTxConfirmed: async () => {
            await XEmbrQuery.refetch.value();
            emit('success', tx);
            reviewing.value = false;
          },
          onTxFailed: () => {
            reviewing.value = false;
          }
        });
      } catch {
        reviewing.value = false;
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
      reviewing,

      appNetworkConfig,
      isWalletReady,
      toggleWalletSelectModal,
      isRequired,
      // methods
      submit
    };
  }
});
</script>
