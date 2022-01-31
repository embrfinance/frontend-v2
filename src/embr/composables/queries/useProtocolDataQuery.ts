import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import { SubgraphBalancer } from '@/services/balancer/subgraph/types';
import { embrService } from '@/embr/services/embr/embr.service';

interface ProtocolData extends SubgraphBalancer {
  embrPrice: number;
  circulatingSupply: number;
}

export default function useProtocolDataQuery(
  options: QueryObserverOptions<ProtocolData> = {}
) {
  const queryFn = async () => {
    const protocolData = await embrService.getProtocolData();

    return {
      poolCount: parseInt(protocolData.poolCount),
      totalSwapFee: parseFloat(protocolData.totalSwapFee),
      totalSwapVolume: parseFloat(protocolData.totalSwapVolume),
      embrPrice: parseFloat(protocolData.embrPrice),
      circulatingSupply: parseFloat(protocolData.circulatingSupply),
      totalLiquidity: parseFloat(protocolData.totalLiquidity)
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