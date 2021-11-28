import { Config } from '@/lib/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { configService as _configService } from '@/services/config/config.service';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import CharredEmbr from '@/embr/services/governance/contracts/cembr';
import { default as CharredEmbrAbi } from '@/embr/abi/CharredEmbr.json';

export default class GovernanceContractsService {
  config: Config;
  provider: JsonRpcProvider;
  cembr: CharredEmbr;

  constructor(
    readonly configService = _configService,
    readonly rpcProviderService = _rpcProviderService
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.config = this.configService.network;

    // Init contracts
    this.cembr = new CharredEmbr(this);
  }

  // Combine all the ABIs and remove duplicates
  public get allABIs() {
    return Object.values(
      Object.fromEntries([...CharredEmbrAbi].map(row => [row.name, row]))
    );
  }
}

export const governanceContractsService = new GovernanceContractsService();
