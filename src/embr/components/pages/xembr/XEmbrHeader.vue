<script setup lang="ts"></script>

<template>
  <div class="flex justify-center mb-8 ml-4 lg:ml-0">
    <div class="flex flex-col w-full max-w-3xl mt-auto mb-2">
      <h2 class="text-white">
        Maximize your Yield
      </h2>
      <h2 class="text-lg font-light mb-4">
        Stake your EMBR and earn xEMBR to vote in Governance
      </h2>
      <p>
        90% of collected Embr protocol fees for 10 tokens are rewarded to xEMBR holders. When you
        stake your EMBR, you receive xEMBR in return which can also be used in governance.
      </p>
      <ol class="list-decimal list-inside ml-2 mt-2">
        <li>90% of Protocol Revenue</li>
        <li>Earn rewards from 10 different tokens</li>
        <li>Vote on which tokens are rewarded</li>
      </ol>
      <!--        <BalLoadingBlock v-if="false" class="h-10 w-40" />-->
    </div>
    <div class="hidden pl-8 ml-6 md:block">
      <img
        src="~@/embr/assets/images/embrE.png"
        style="width: 256px; max-width: 256px;"
      />
    </div>
  </div>
</template>
