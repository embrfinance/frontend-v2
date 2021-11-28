import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import { UserPortfolio } from '@/embr/services/embr/embr-types';
import useWeb3 from '@/services/web3/useWeb3';
import { embrService } from '@/embr/services/embr/embr.service';
import useApp from '@/composables/useApp';

export default function usePortfolioQuery(
  options: QueryObserverOptions<UserPortfolio> = {}
) {
  const { appLoading } = useApp();
  const { account, chainId, isLoadingProfile } = useWeb3();

  const enabled = computed(
    () => !appLoading.value && !isLoadingProfile.value && !!account.value
  );

  const queryKey = reactive(QUERY_KEYS.Account.Portfolio(account, chainId));

  const queryFn = async () => {
    const response = await embrService.getUserPortfolio(account.value);

    return response;
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<UserPortfolio>(queryKey, queryFn, queryOptions);
}
