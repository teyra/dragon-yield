"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { readContract, writeContract } from "@wagmi/core";
import { config } from "@/wagmiConfig";

const stakingContractAddress = "0xYourStakingContractAddress"; // 替换为实际的质押合约地址
const stakingContractABI = [
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function getReward() external",
  "function earned(address account) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
];

const StakingPanel = () => {
  const { address } = useAccount(); // 获取用户钱包地址
  const [stakeAmount, setStakeAmount] = useState(""); // 用户输入的质押金额
  const [reward, setReward] = useState("0"); // 用户的奖励余额
  const [stakedBalance, setStakedBalance] = useState("0"); // 用户的质押余额
  const [totalSupply, setTotalSupply] = useState("0"); // 质押池的总锁仓量
  const [isPending, setIsPending] = useState(false); // 交易状态

  useEffect(() => {
    // 获取用户的质押余额和奖励
    const fetchStakingData = async () => {
      try {
        const staked = await readContract(config, {
          address: stakingContractAddress,
          abi: stakingContractABI,
          functionName: "balanceOf",
          args: [address],
        });
        const earned = await readContract(config, {
          address: stakingContractAddress,
          abi: stakingContractABI,
          functionName: "earned",
          args: [address],
        });
        const total = await readContract(config, {
          address: stakingContractAddress,
          abi: stakingContractABI,
          functionName: "totalSupply",
        });

        setStakedBalance(formatUnits(staked as bigint, 18));
        setReward(formatUnits(earned as bigint, 18));
        setTotalSupply(formatUnits(total as bigint, 18));
      } catch (error) {
        console.error("Error fetching staking data:", error);
      }
    };
    if (address) {
      fetchStakingData();
    }
  }, [address]);

  // 质押代币
  const handleStake = async () => {
    if (!stakeAmount) {
      alert("请输入质押金额");
      return;
    }
    setIsPending(true);
    try {
      await writeContract(config, {
        address: stakingContractAddress,
        abi: stakingContractABI,
        functionName: "stake",
        args: [parseUnits(stakeAmount, 18)],
      });
      alert("质押成功！");
    } catch (error) {
      console.error("Error staking:", error);
      alert("质押失败，请检查输入！");
    } finally {
      setIsPending(false);
    }
  };

  // 解押代币
  const handleWithdraw = async () => {
    if (!stakeAmount) {
      alert("请输入解押金额");
      return;
    }
    setIsPending(true);
    try {
      await writeContract(config, {
        address: stakingContractAddress,
        abi: stakingContractABI,
        functionName: "withdraw",
        args: [parseUnits(stakeAmount, 18)],
      });
      alert("解押成功！");
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("解押失败，请检查输入！");
    } finally {
      setIsPending(false);
    }
  };

  // 领取奖励
  const handleClaimReward = async () => {
    setIsPending(true);
    try {
      await writeContract(config, {
        address: stakingContractAddress,
        abi: stakingContractABI,
        functionName: "getReward",
      });
      alert("奖励领取成功！");
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("奖励领取失败！");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">质押面板</h2>
      <p className="mb-2">总锁仓量: {totalSupply} 代币</p>
      <p className="mb-2">我的质押: {stakedBalance} 代币</p>
      <p className="mb-4">我的奖励: {reward} 代币</p>
      <div className="mb-4">
        <label className="block mb-2">质押/解押金额:</label>
        <input
          type="number"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
          placeholder="输入金额"
        />
      </div>
      <div className="flex justify-between">
        <button
          onClick={handleStake}
          disabled={isPending}
          className={`${
            isPending ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
          } text-white px-4 py-2 rounded`}
        >
          {isPending ? "处理中..." : "质押"}
        </button>
        <button
          onClick={handleWithdraw}
          disabled={isPending}
          className={`${
            isPending ? "bg-gray-500" : "bg-red-500 hover:bg-red-600"
          } text-white px-4 py-2 rounded`}
        >
          {isPending ? "处理中..." : "解押"}
        </button>
      </div>
      <button
        onClick={handleClaimReward}
        disabled={isPending}
        className={`mt-4 ${
          isPending ? "bg-gray-500" : "bg-green-500 hover:bg-green-600"
        } text-white px-4 py-2 rounded w-full`}
      >
        {isPending ? "处理中..." : "领取奖励"}
      </button>
    </div>
  );
};

export default StakingPanel;
