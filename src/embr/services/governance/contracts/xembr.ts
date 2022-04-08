import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { call, Multicaller } from '@/lib/utils/balancer/contract';
import { default as XEmbrAbi } from '@/embr/abi/XEmbr.json';
import { default as ERC20Abi } from '@/lib/abi/ERC20.json';
import { BigNumber } from 'ethers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { Web3Provider } from '@ethersproject/providers';

interface GlobalData {
  periodFinish: BigNumber
  lastUpdateTime: BigNumber
  rewardRate: BigNumber
  rewardPerTokenStored: BigNumber 
}

interface UserData {
  rewardPerTokenPaid: BigNumber
  rewards: BigNumber
  rewardsPaid: BigNumber
}

interface Balance {
  /// units of staking token that has been deposited and consequently wrapped
  raw: BigNumber
  /// (block.timestamp - weightedTimestamp) represents the seconds a user has had their full raw balance wrapped.
  /// If they deposit or withdraw, the weightedTimestamp is dragged towards block.timestamp proportionately
  weightedTimestamp: BigNumber
  /// multiplier awarded for staking for a long time
  timeMultiplier: BigNumber
  /// multiplier duplicated from QuestManager
  questMultiplier: BigNumber
  /// Time at which the relative cooldown began
  cooldownTimestamp: BigNumber
  /// Units up for cooldown
  cooldownUnits: BigNumber
}

export default class XEmbr {
  service: Service;

  constructor(service, private readonly configService = new ConfigService()) {
    this.service = service;
  }

  public async getData(
    account: string
  ): Promise<{
    embrBalance: BigNumber;
    userStaking: Balance;
    xEmbrBalance: BigNumber;
  }> {
    const multicaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      XEmbrAbi
    );

    multicaller.call('embrBalance', this.embrAddress, 'balanceOf', [account]);
    multicaller.call('xEmbrBalance', this.xembrAddress, 'balanceOf', [account]);
    multicaller.call('userStaking', this.xembrAddress, 'balanceData', [
      account
    ]);

    return multicaller.execute();
  }

  public async getTotalXEmbrSupply(): Promise<BigNumber> {
    return await call(this.service.provider, XEmbrAbi, [
      this.xembrAddress,
      'totalSupply'
    ]);
  }

  public async allowance(account: string): Promise<BigNumber> {
    return await call(this.service.provider, ERC20Abi, [
      this.embrAddress,
      'allowance',
      [account, this.xembrAddress]
    ]);
  }

  public async xEmbrBalanceOf(account: string): Promise<BigNumber> {
    return await call(this.service.provider, XEmbrAbi, [
      this.xembrAddress,
      'balanceOf',
      [account]
    ]);
  }

  public async earned(account: string, pid: string): Promise<BigNumber> {
    return await call(this.service.provider, XEmbrAbi, [
      this.xembrAddress,
      'earned',
      [BigNumber.from(pid), account]
    ]);
  }

  public async userData(pid: string, account: string): Promise<UserData> {
    return await call(this.service.provider, XEmbrAbi, [
      this.xembrAddress,
      'userData',
      [BigNumber.from(pid), account]
    ]);
  }

  public async getGlobalData(tid: string): Promise<GlobalData> {
    return await call(this.service.provider, XEmbrAbi, [
      this.xembrAddress,
      'globalData',
      [BigNumber.from(tid)]
    ]);
  }

  public async getRewardToken(tid: string): Promise<string> {
    return await call(this.service.provider, XEmbrAbi, [
      this.xembrAddress,
      'getRewardToken',
      [BigNumber.from(tid)]
    ]);
  } 

  public async activeTokenCount(): Promise<BigNumber> {
    return await call(this.service.provider, XEmbrAbi, [
      this.xembrAddress,
      'activeTokenCount',
      []
    ]);
  } 

  public async reviewTimestamp(provider: Web3Provider, account: string) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'reviewTimestamp',
      [account]
    );
  } 

  public async embrBalanceOf(account: string): Promise<BigNumber> {
    return await call(this.service.provider, ERC20Abi, [
      this.embrAddress,
      'balanceOf',
      [account]
    ]);
  }

  public async stake(provider: Web3Provider, amount: string) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'stake(uint256)',
      [BigNumber.from(amount)]
    );
  }

  public async stakeDelegate(provider: Web3Provider, amount: string, delegate: string) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'stake(uint256, address)',
      [BigNumber.from(amount), delegate]
    );
  }

  public async stakeExitCooldown(provider: Web3Provider, amount: string, exitCooldown: boolean) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'stake(uint256, bool)',
      [BigNumber.from(amount), exitCooldown]
    );
  }

  public async startCooldown(provider: Web3Provider, amount: string) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'startCooldown',
      [BigNumber.from(amount)]
    );
  }

  public async endCooldown(provider: Web3Provider) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'endCooldown',
      []
    );
  }

  public async withdraw(provider: Web3Provider, amount: string, receipent: string, exitCooldown: boolean) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'withdraw',
      [BigNumber.from(amount), receipent, true, exitCooldown]
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
      'claimReward(uint256)',
      [BigNumber.from(pid)]
    );
  }

  public async claimRedemption(provider: Web3Provider) {
    return sendTransaction(
      provider,
      this.xembrAddress,
      XEmbrAbi,
      'claimRedemptionReward',
      []
    );
  }

  public get embrAddress(): string {
    return this.service.config.addresses.embr || '';
  }
  public get xembrAddress(): string {
    return this.service.config.xEmbr.address || '';
  }
}
