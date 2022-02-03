import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/embr/constants/queryKeys';
import { embrService } from '@/embr/services/embr/embr.service';
import { GqlLge } from '@/embr/services/embr/embr-types';

export default function useLgesQuery(options: UseQueryOptions<GqlLge[]> = {}) {
  const queryKey = reactive(QUERY_KEYS.Lges.All);

  const queryFn = async () => {
    return embrService.getLges();
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<GqlLge[]>(queryKey, queryFn, queryOptions);
}
