import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { call, Multicaller } from '@/lib/utils/balancer/contract';
import { default as XEmbrAbi } from '@/embr/abi/XEmbr.json';
import { default as ERC20Abi } from '@/lib/abi/ERC20.json';
import { BigNumber } from 'ethers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { Web3Provider } from '@ethersproject/providers';

interface LockedBalance {
  amount: BigNumber
  end: BigNumber
  start: BigNumber
}

interface RewardInfo { 
  current: BigNumber
  last: BigNumber
  expiry: BigNumber
}

export default class XEmbr {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getData(
    account: string
  ): Promise<{
    totalXembrSupply: BigNumber;
    totalEmbrStaking: BigNumber;
    userBalance: BigNumber;
    embrBalance: BigNumber;
    userLocked: LockedBalance;
    allowance: BigNumber;
    rewardTokens: string[];
    activeRewardInfo: RewardInfo[];
  }> {
    const multicaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      XEmbrAbi
    );

    multicaller.call('totalXembrSupply', this.xembrAddress, 'totalSupply', []);
    multicaller.call('totalEmbrStaked', this.embrAddress, 'balanceOf', [
      this.xembrAddress
    ]);
    multicaller.call('userBalance', this.xembrAddress, 'balanceOf', [account]);
    multicaller.call('embrBalance', this.embrAddress, 'balanceOf', [account]);
    multicaller.call('totalEmbrStaking', this.embrAddress, 'balanceOf', [this.xembrAddress]);
    multicaller.call('activeRewardInfo', this.xembrAddress, 'activeRewardInfo', []);
    multicaller.call('rewardTokens', this.xembrAddress, 'rewardTokens', []);
    multicaller.call('userLocked', this.xembrAddress, 'locked', [
      account
    ]);
    multicaller.call('allowance', this.embrAddress, 'allowance', [
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

  public async xEmbrBalanceOf(account: string): Promise<BigNumber> {
    return await call(this.service.provider, XEmbrAbi, [
      this.xembrAddress,
      'balanceOf',
      [account]
    ]);
  }

  public async earned(pid: string, account: string): Promise<BigNumber> {
    return await call(this.service.provider, ERC20Abi, [
      this.xembrAddress,
      'earned',
      [BigNumber.from(pid), account]
    ]);
  }

  public async locked(account: string): Promise<BigNumber> {
    return await call(this.service.provider, ERC20Abi, [
      this.xembrAddress,
      'locked',
      [account]
    ]);
  }

  public async rewardTokens(account: string): Promise<BigNumber> {
    return await call(this.service.provider, ERC20Abi, [
      this.xembrAddress,
      'rewardTokens',
      []
    ]);
  }

  public async activeRewardInfo(account: string): Promise<BigNumber> {
    return await call(this.service.provider, ERC20Abi, [
      this.xembrAddress,
      'activeRewardInfo',
      []
    ]);
  }

  public async embrBalanceOf(account: string): Promise<BigNumber> {
    return await call(this.service.provider, ERC20Abi, [
      this.embrAddress,
      'balanceOf',
      [account]
    ]);
  }

  public async createLock(provider: Web3Provider, amount: string, unlock_time: string) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'createLock',
      [BigNumber.from(amount), BigNumber.from(unlock_time)]
    );
  }

  public async increaseLockLength(provider: Web3Provider, unlock_time: string) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'increaseLockLength',
      [BigNumber.from(unlock_time)]
    );
  }

  public async increaseLockAmount(provider: Web3Provider, amount: string) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'increaseLockAmount',
      [BigNumber.from(amount)]
    );
  }

  public async withdraw(provider: Web3Provider) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'withdraw',
      []
    );
  }

  public async claimAll(provider: Web3Provider) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'claimRewards',
      []
    );
  }

  public async claim(provider: Web3Provider, pid: string) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'claimReward',
      [BigNumber.from(pid)]
    );
  }

  public get embrAddress(): string {
    return this.service.config.addresses.embr || '';
  }
  public get xembrAddress(): string {
    return this.service.config.xEmbr.address || '';
  }
}
