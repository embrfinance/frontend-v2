import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import { FETCH_ONCE_OPTIONS } from '@/constants/vue-query';
import { EmbrConfig, embrService } from '@/embr/services/embr/embr.service';

/**
 * Fetch all token lists, should only happen once.
 */
export default function useEmbrConfigQuery(
  options: UseQueryOptions<EmbrConfig> = {}
) {
  const queryKey = reactive(QUERY_KEYS.Config.All);

  const queryFn = async () => {
    console.log('Fetching embr config');
    return embrService.getEmbrConfig();
  };

  const queryOptions = reactive({
    enabled: true,
    ...FETCH_ONCE_OPTIONS,
    ...options
  });

  return useQuery<EmbrConfig>(queryKey, queryFn, queryOptions);
}
