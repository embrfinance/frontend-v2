import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { call, Multicaller } from '@/lib/utils/balancer/contract';
import { default as XEmbrAbi } from '@/embr/abi/XEmbr.json';
import { default as ERC20Abi } from '@/lib/abi/ERC20.json';
import { BigNumber } from 'ethers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { Web3Provider } from '@ethersproject/providers';

export default class XEmbr {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getData(
    account: string
  ): Promise<{
    totalXembrSupply: BigNumber;
    totalBptStaked: BigNumber;
    userBalance: BigNumber;
    userBptTokenBalance: BigNumber;
    allowance: BigNumber;
  }> {
    const multicaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      XEmbrAbi
    );

    multicaller.call('totalXembrSupply', this.xembrAddress, 'totalSupply', []);
    multicaller.call('totalBptStaked', this.bptTokenAddress, 'balanceOf', [
      this.xembrAddress
    ]);
    multicaller.call('userBalance', this.xembrAddress, 'balanceOf', [account]);
    multicaller.call('userBptTokenBalance', this.bptTokenAddress, 'balanceOf', [
      account
    ]);
    multicaller.call('allowance', this.bptTokenAddress, 'allowance', [
      account,
      this.xembrAddress
    ]);

    return multicaller.execute();
  }

  public async getTotalXEmbrSupply(): Promise<BigNumber> {
    return await call(this.service.provider, XEmbrAbi, [
      this.xembrAddress,
      'totalSupply'
    ]);
  }

  public async getTotalVestedTokenAmount(): Promise<BigNumber> {
    return await call(this.service.provider, XEmbrAbi, [
      this.bptTokenAddress,
      'balanceOf',
      [this.xembrAddress]
    ]);
  }

  public async xEmbrBalanceOf(account: string): Promise<BigNumber> {
    return await call(this.service.provider, XEmbrAbi, [
      this.xembrAddress,
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
      this.xembrAddress,
      XEmbrAbi,
      'enter',
      [BigNumber.from(amount)]
    );
  }

  public async leave(provider: Web3Provider, amount: string) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'leave',
      [BigNumber.from(amount)]
    );
  }

  public get xembrAddress(): string {
    return this.service.config.xEmbr.address || '';
  }
  public get bptTokenAddress(): string {
    return this.service.config.xEmbr.poolAddress || '';
  }
}
