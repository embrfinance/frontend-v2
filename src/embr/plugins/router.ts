import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import HomePage from '@/embr/pages/Invest.vue';
import PoolPage from '@/embr/pages/pool/_id.vue';
import PoolInvestPage from '@/embr/pages/pool/invest.vue';
import PoolWithdrawPage from '@/embr/pages/pool/withdraw.vue';
import LiquidityMiningPage from '@/pages/liquidity-mining.vue';
import TradePage from '@/embr/pages/trade.vue';
import PoolCreate from '@/embr/pages/PoolCreate.vue';
import Portfolio from '@/embr/pages/Portfolio.vue';
import CreatePoolPage from '@/embr/pages/pool/create.vue';
import XEmbr from '@/embr/pages/XEmbr.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', redirect: '/trade' },
  {
    path: '/trade/:assetIn?/:assetOut?',
    name: 'trade',
    component: TradePage
  },
  {
    path: '/swap/:assetIn?/:assetOut?',
    redirect: to => {
      return `/trade${to.path.split('/swap')[1]}`;
    }
  },
  {
    path: '/pool/:id',
    name: 'pool',
    component: PoolPage
  },
  {
    path: '/pool/:id/invest',
    name: 'invest',
    component: PoolInvestPage,
    meta: { layout: 'PoolTransferLayout' }
  },
  {
    path: '/pool/:id/withdraw',
    name: 'withdraw',
    component: PoolWithdrawPage,
    meta: { layout: 'PoolTransferLayout' }
  },
  {
    path: '/liquidity-mining',
    name: 'liquidity-mining',
    component: LiquidityMiningPage
  },
  { path: '/pools', name: 'pools', component: HomePage },

  {
    path: '/pool/create',
    name: 'create-pool',
    component: CreatePoolPage
  },

  { path: '/pool-create', name: 'pool-create', component: PoolCreate },
  { path: '/my-portfolio', name: 'my-portfolio', component: Portfolio },
  { path: '/stake', name: 'stake', component: XEmbr },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
];

/**
 * DEV/STAGING ONLY ROUTES
 */
if (
  ['development', 'staging'].includes(process.env.VUE_APP_ENV || 'development')
) {
  // routes.push();
}

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
