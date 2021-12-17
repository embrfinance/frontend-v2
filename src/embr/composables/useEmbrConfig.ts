import { computed } from 'vue';
import useEmbrConfigQuery from '@/embr/composables/queries/useEmbrConfigQuery';
import { EmbrConfig } from '@/embr/services/embr/embr.service';

export default function useEmbrConfig() {
  const embrConfigQuery = useEmbrConfigQuery();

  const embrConfigLoading = computed(
    () => embrConfigQuery.isLoading.value || embrConfigQuery.isIdle.value
  );

  const embrConfig = computed(
    (): EmbrConfig => {
      return embrConfigQuery.data.value
        ? embrConfigQuery.data.value
        : { incentivizedPools: [], 
          blacklistedPools: [], 
          pausedPools: [], 
          featuredPools: [] 
        }
    }
  );

  return {
    embrConfigLoading,
    embrConfig
  };
}
