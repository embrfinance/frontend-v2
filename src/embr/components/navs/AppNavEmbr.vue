<template>
  <BalPopover no-pad>
    <template v-slot:activator>
      <BalBtn
        color="transparent"
        flat
        class="mr-2 text-base"
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        :circle="upToLargeBreakpoint"
      >
        <img
          src="~@/embr/assets/images/embr.png"
          width="28"
          :class="{ 'mr-2': !upToLargeBreakpoint }"
          v-if="upToLargeBreakpoint ? !loading : true"
        />
        <BalLoadingIcon size="sm" v-if="loading" />
        <span class="hidden lg:block" v-else>
          {{ fNum(embrPrice, 'usd') }}
        </span>
      </BalBtn>
    </template>
    <div class="w-80 sm:w-96">
      <div class="flex justify-between">
        <h5 class="text-lg mb-3 px-3 pt-3">
          Embr
        </h5>
        <BalBtn
           v-if="statusV1 == 0"
          color="transparent"
          flat
          class="mr-2 text-base"
          :size="upToLargeBreakpoint ? 'md' : 'sm'"
          :circle="upToLargeBreakpoint"
          @click="addTokenToMetaMask"
      >
        <img
          src="~@/embr/assets/images/embr.png"
          width="28"
          :class="{ 'mr-2': !upToLargeBreakpoint }"
          v-if="upToLargeBreakpoint ? !loading : true"
        />
        <span class="hidden lg:block">
          Add EMBR to Wallet
        </span>
      </BalBtn>
        <button class="bal-btn migrate" v-if="statusV1 == 1" @click="approveV1">Approve V2</button>
        <button class="bal-btn migrate" v-if="statusV1 == 2" @click="migrateV1">Migrate V2</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2 px-2 mb-2">
        <BalCard>
          <div class="text-sm text-gray-200 font-medium mb-2 text-left">
            TVL
          </div>
          <div class="text-xl font-medium truncate flex items-center">
            ${{ fNum(tvl, 'usd_lg') }}
          </div>
        </BalCard>
        <BalCard>
          <div class="text-sm text-gray-200 font-medium mb-2 text-left">
            Embr
          </div>
          <div class="text-xl font-medium truncate flex items-center">
            {{ fNum(embrPrice, 'usd') }}
          </div>
        </BalCard>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2 px-2 mb-2">
        <BalCard>
          <div class="text-sm text-gray-200 font-medium mb-2 text-left">
            Market Cap
          </div>
          <div class="text-xl font-medium truncate flex items-center">
            ${{ fNum(marketCap, 'usd_lg') }}
          </div>
        </BalCard>
        <BalCard>
          <div class="text-sm text-gray-200 font-medium mb-2 text-left">
            Circulating Supply
          </div>
          <div class="text-xl font-medium truncate flex items-center">
            {{ fNum(circulatingSupply, 'token_lg') }}
          </div>
        </BalCard>
      </div>
    </div>
  </BalPopover>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import useNumbers from '@/composables/useNumbers';
import { sumBy } from 'lodash';
import numeral from 'numeral';
import usePools from '@/composables/pools/usePools';
import useEthers from '@/composables/useEthers';
import useWeb3 from '@/services/web3/useWeb3';
import useBreakpoints from '@/composables/useBreakpoints';
import useTransactions from '@/composables/useTransactions';
import { Alert } from '@/composables/useAlerts';
//import { useXEmbr } from '@/embr/composables/stake/useXEmbr';
import useProtocolDataQuery from '@/embr/composables/queries/useProtocolDataQuery';
import { erc20ContractService } from '@/embr/services/erc20/erc20-contracts.service';
import { configService } from '@/services/config/config.service';
import { WalletToken } from '@/types';

export default defineComponent({
  name: 'AppNavEmbr',

  data: () => {
    return {
      statusV1: 0
    };
  },

  props: {
    Alert: { type: Object as PropType<Alert>, required: true }
  },

  watch: {
    loading: function() {
      if (!this.loading) {
        this.fetchV1();
      }
    }
  },

  methods: {
    fetchV1: async function() {
      const { account } = this;
      const allowance = await erc20ContractService.erc20.allowance(
        '0x9FBA6AacB11010999355E60675A734278345B13C',
        account,
        '0x8A50748a79D20F493F4776C07C922e52eFD61c95'
      );
      const balance = await erc20ContractService.erc20.balanceOf(
        '0x9FBA6AacB11010999355E60675A734278345B13C',
        account
      );

      if (Number(balance) > 0) {
        if (Number(allowance) > 0) {
          this.statusV1 = 2;
        } else {
          this.statusV1 = 1;
        }
      } else {
        this.statusV1 = 0;
      }
    },
    approveV1: async function () {
      const tx = await erc20ContractService.erc20.approveToken(
        this.getProvider(),
        '0x8A50748a79D20F493F4776C07C922e52eFD61c95',
        '0x9FBA6AacB11010999355E60675A734278345B13C',
        '115792089237316195423570985008687907853269984665640564039457584007913129639935'
      );
      this.addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: `Approving V1 for V2`,
        details: {
          contractAddress: '0x9FBA6AacB11010999355E60675A734278345B13C',
          spender: '0x8A50748a79D20F493F4776C07C922e52eFD61c95'
        }
      });
      this.statusV1 = 2
      return tx;
    },
    migrateV1: async function () {
      const tx = await erc20ContractService.erc20.migrateToken(
        this.getProvider(),
        '0x9FBA6AacB11010999355E60675A734278345B13C'
      );
      this.addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'approve',
        summary: `Migrating V1 for V2`,
        details: {
          contractAddress: '0x8A50748a79D20F493F4776C07C922e52eFD61c95',
          v1: '0x9FBA6AacB11010999355E60675A734278345B13C'
        }
      });
      this.statusV1 = 0
      return tx;
    }
  },

  setup() {
    const { getProvider, account, getAddTokenToWallet } = useWeb3();
    const { addTransaction } = useTransactions();

    const { fNum } = useNumbers();
    const { upToLargeBreakpoint } = useBreakpoints();

    const protocolDataQuery = useProtocolDataQuery();
    const tvl = computed(
      () => protocolDataQuery.data?.value?.totalLiquidity || 0
    );

    const embrPrice = computed(
      () => protocolDataQuery.data?.value?.embrPrice || 0
    );
    const circulatingSupply = computed(
      () => protocolDataQuery.data.value?.circulatingSupply || 0
    );
    const marketCap = computed(() => {
      return embrPrice.value * circulatingSupply.value;
    });
    const loading = computed(() => protocolDataQuery.isLoading.value);

     async function addTokenToMetaMask() { 
        const token = { 
            address: configService.network.addresses.embr,
            type: 'ERC20',
            symbol: "EMBR",
            decimals: 18,
            logoURI: "https://raw.githubusercontent.com/embrfinance/frontend-v2/embr-staging/src/embr/assets/images/embr.png"  
      } as WalletToken;
      await getAddTokenToWallet(token)
    }

    return {
      account,
      fNum,
      upToLargeBreakpoint,
      embrPrice,
      tvl,
      circulatingSupply,
      marketCap,
      loading,
      addTransaction,
      getProvider,
      addTokenToMetaMask
    };
  }
});
</script>

<style>
.app-nav-alert {
  @apply flex items-center justify-between py-4 px-6;
}
</style>
<style scoped>
.bal-btn.migrate {
  padding: 0 20px;
  width: auto;
  font-size: small;
}
</style>
