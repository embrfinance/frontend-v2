import { computed } from 'vue';
import useEmbrConfigQuery from '@/embr/composables/queries/useEmbrConfigQuery';
import { GqlEmbrConfig } from '@/embr/services/embr/embr-types';

export default function useEmbrConfig() {
  const embrConfigQuery = useEmbrConfigQuery();

  const embrConfigLoading = computed(
    () => 
    embrConfigQuery.isLoading.value || 
    embrConfigQuery.isIdle.value
  );

  const embrConfig = computed(
    (): GqlEmbrConfig =>
      embrConfigQuery.data.value
        ? embrConfigQuery.data.value
        : { 
          incentivizedPools: [], 
          blacklistedPools: [], 
          pausedPools: [], 
          featuredPools: [] ,
          poolFilters: []
        }
  );

  return {
    embrConfigLoading,
    embrConfig
  };
}
