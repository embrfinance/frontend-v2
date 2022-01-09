import { Config } from '@/lib/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { configService as _configService } from '@/services/config/config.service';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import XEmbr from '@/embr/services/governance/contracts/xembr';
import { default as XEmbrAbi } from '@/embr/abi/XEmbr.json';

export default class GovernanceContractsService {
  config: Config;
  provider: JsonRpcProvider;
  xembr: XEmbr;

  constructor(
    readonly configService = _configService,
    readonly rpcProviderService = _rpcProviderService
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.config = this.configService.network;

    // Init contracts
    this.xembr = new XEmbr(this);
  }

  // Combine all the ABIs and remove duplicates
  public get allABIs() {
    return Object.values(
      Object.fromEntries([...XEmbrAbi].map(row => [row.name, row]))
    );
  }
}

export const governanceContractsService = new GovernanceContractsService();
