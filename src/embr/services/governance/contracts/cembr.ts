import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { call, Multicaller } from '@/lib/utils/balancer/contract';
import { default as CharredEmbrAbi } from '@/embr/abi/CharredEmbr.json';
import { default as ERC20Abi } from '@/lib/abi/ERC20.json';
import { BigNumber } from 'ethers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { Web3Provider } from '@ethersproject/providers';

export default class CharredEmbr {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getData(
    account: string
  ): Promise<{
    totalCembrSupply: BigNumber;
    totalBptStaked: BigNumber;
    userBalance: BigNumber;
    userBptTokenBalance: BigNumber;
    allowance: BigNumber;
  }> {
    const multicaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      CharredEmbrAbi
    );

    multicaller.call('totalCembrSupply', this.cembrAddress, 'totalSupply', []);
    multicaller.call('totalBptStaked', this.bptTokenAddress, 'balanceOf', [
      this.cembrAddress
    ]);
    multicaller.call('userBalance', this.cembrAddress, 'balanceOf', [account]);
    multicaller.call('userBptTokenBalance', this.bptTokenAddress, 'balanceOf', [
      account
    ]);
    multicaller.call('allowance', this.bptTokenAddress, 'allowance', [
      account,
      this.cembrAddress
    ]);

    return multicaller.execute();
  }

  public async getTotalCharredEmbrSupply(): Promise<BigNumber> {
    return await call(this.service.provider, CharredEmbrAbi, [
      this.cembrAddress,
      'totalSupply'
    ]);
  }

  public async getTotalVestedTokenAmount(): Promise<BigNumber> {
    return await call(this.service.provider, CharredEmbrAbi, [
      this.bptTokenAddress,
      'balanceOf',
      [this.cembrAddress]
    ]);
  }

  public async cEmbrBalanceOf(account: string): Promise<BigNumber> {
    return await call(this.service.provider, CharredEmbrAbi, [
      this.cembrAddress,
      'balanceOf',
      [account]
    ]);
  }

  public async bptBalanceOf(account: string): Promise<BigNumber> {
    return await call(this.service.provider, ERC20Abi, [
      this.bptTokenAddress,
      'balanceOf',
      [account]
    ]);
  }

  public async enter(provider: Web3Provider, amount: string) {
    return sendTransaction(
      provider,
      this.cembrAddress,
      CharredEmbrAbi,
      'enter',
      [BigNumber.from(amount)]
    );
  }

  public async leave(provider: Web3Provider, amount: string) {
    return sendTransaction(
      provider,
      this.cembrAddress,
      CharredEmbrAbi,
      'leave',
      [BigNumber.from(amount)]
    );
  }

  public get cembrAddress(): string {
    return this.service.config.cEmbr.address || '';
  }
  public get bptTokenAddress(): string {
    return this.service.config.cEmbr.poolAddress || '';
  }
}
