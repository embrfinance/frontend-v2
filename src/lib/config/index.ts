import homestead from './homestead.json';
import kovan from './kovan.json';
import rinkeby from '../../embr/config/rinkeby.json';
import polygon from './polygon.json';
import arbitrum from './arbitrum.json';
import fuji from '../../embr/config/fuji.json';
import avalanche from '../../embr/config/avalanche.json';
import docker from './docker.json';
import test from './test.json';
import { Network } from '@/composables/useNetwork';

export interface Config {
  key: string;
  chainId: Network | 12345 | 17;
  chainName: string;
  name: string;
  shortName: string;
  network: string;
  portisNetwork?: string;
  unknown: boolean;
  rpc: string;
  publicRpc?: string;
  ws: string;
  loggingRpc: string;
  explorer: string;
  explorerName: string;
  subgraph: string;
  poolsUrlV1: string;
  poolsUrlV2: string;
  supportsEIP1559: boolean;
  supportsElementPools: boolean;
  nativeAsset: {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    deeplinkId: string;
    logoURI: string;
    minTransactionBuffer: string;
  };
  addresses: {
    exchangeProxy: string;
    merkleRedeem: string;
    merkleOrchard: string;
    multicall: string;
    vault: string;
    weightedPoolFactory: string;
    stablePoolFactory: string;
    weth: string;
    stETH: string;
    wstETH: string;
    lidoRelayer: string;
    balancerHelpers: string;
    embrToken: string;
    hndRewarder: string;
    masterChef: string;
    earlyLudwigNft: string;
    hnd: string;
    embrUsdcReferencePricePool: string;
    embr: string;
    usdc: string;
    ausd: string;
    defaultPoolOwner: string;
    copperProxy: string;
    batchRelayer: string;
  };
  keys: {
    infura: string;
    alchemy: string;
  };
  strategies: Record<
    string,
    {
      type: string;
      name: string;
    }
  >;
  backendUrl: string;
  configSanityUrl: string;
  blockSubgraph: string;
  farmSubgraph: string;
  tokenListSanityUrl: string;
  xEmbr: {
    address: string;
    poolAddress: string;
    poolId: string;
  };
}

const config: Record<Config['chainId'], Config> = {
  //[Network.MAINNET]: homestead,
  //[Network.KOVAN]: kovan,
  //[Network.RINKEBY]: rinkeby,
  //[Network.POLYGON]: polygon,
  //[Network.ARBITRUM]: arbitrum,
  [Network.FUJI]: fuji,
  [Network.AVALANCHE]: avalanche,
  //12345: test,
  // @ts-ignore
  17: docker
};

export default config;
