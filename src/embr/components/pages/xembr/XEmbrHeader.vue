<script setup lang="ts"></script>

<template>
  <div class="flex justify-center mb-8 ml-4 lg:ml-0">
    <div class="flex flex-col w-full max-w-3xl mt-auto mb-2">
      <h2 class="text-white">
        Maximize your Yield
      </h2>
      <h2 class="text-lg font-light mb-4">
        Stake your EMBR for xEMBR and earn!
      </h2>
      <p class="mb-2">
        All collected Embr protocol fees for up to 10 tokens are rewarded to all xEMBR holders. When you
        stake your EMBR you receive xEMBR, a non transferable token, in return which represents your share of the rewards.
      </p>
       <p class="mb-2">
        Once a week protocol fees are collected and distrubted over the proceeding week.  
      </p>
      <p class="mb-2">
        Withdrawing your EMBR requires a cooldown period of 1 week, as well as a paper hands fee 
        if you withdraw your EMBR based on <a href="#">this</a> schedule 
      </p>
      <ol class="list-decimal list-inside ml-2 mt-2">
        <li>100% of Protocol Revenue</li>
        <li>Earn rewards from up to 10 different tokens</li>
        <li>Earn multiplers for staking longer</li>
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
