import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import useWeb3 from '@/services/web3/useWeb3';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { masterChefContractsService } from '@/embr/services/farm/master-chef-contracts.service';
import { SubgraphBalancer } from '@/services/balancer/subgraph/types';

interface ProtocolData extends SubgraphBalancer {
  embrPrice: number;
  circulatingSupply: number;
}

export default function useProtocolDataQuery(
  options: QueryObserverOptions<ProtocolData> = {}
) {
  const { appNetworkConfig } = useWeb3();

  const queryFn = async () => {
    const [embrPool] = await balancerSubgraphService.pools.get({
      where: {
        id: appNetworkConfig.addresses.embrUsdcReferencePricePool.toLowerCase(),
        totalShares_gt: -1 // Avoid the filtering for low liquidity pools
      }
    });

    if (!embrPool) {
      throw new Error('Could not load embr reference price pool');
    }

    const balancerData = await balancerSubgraphService.balancers.get();
    const embrPrice = await getBeetsPrice(
      appNetworkConfig.addresses.embrUsdcReferencePricePool,
      appNetworkConfig.addresses.embr,
      appNetworkConfig.addresses.usdc
    );

    const circulatingSupply = await masterChefContractsService.embrToken.getCirculatingSupply();

    return {
      ...balancerData,
      embrPrice,
      circulatingSupply
    };
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<ProtocolData>(
    QUERY_KEYS.ProtocolData.All,
    queryFn,
    queryOptions
  );
}

export async function getBeetsPrice(
  poolId: string,
  embrAddress: string,
  usdcAddress: string
) {
  const [embrPool] = await balancerSubgraphService.pools.get({
    where: {
      id: poolId.toLowerCase(),
      totalShares_gt: -1 // Avoid the filtering for low liquidity pools
    }
  });

  const embr = embrPool?.tokens.find(
    token => token.address.toLowerCase() === embrAddress.toLowerCase()
  );
  const usdc = embrPool?.tokens.find(
    token => token.address.toLowerCase() === usdcAddress.toLowerCase()
  );

  if (!embr || !usdc) {
    return 0;
  }

  return (
    ((parseFloat(embr.weight) / parseFloat(usdc.weight)) *
      parseFloat(usdc.balance)) /
    parseFloat(embr.balance)
  );
}
