"use client";
import { useState } from "react";
import { NextPage } from "next";

const StakingPage: NextPage = () => {
  const [stakedAmount, setStakedAmount] = useState(0); // 用户质押的金额
  const [inputAmount, setInputAmount] = useState(""); // 用户输入的金额
  const [rewards, setRewards] = useState(0); // 用户的奖励

  const handleStake = () => {
    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("请输入有效的金额");
      return;
    }
    setStakedAmount(stakedAmount + amount);
    setInputAmount("");
  };

  const handleUnstake = () => {
    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0 || amount > stakedAmount) {
      alert("请输入有效的金额，且不能超过质押金额");
      return;
    }
    setStakedAmount(stakedAmount - amount);
    setInputAmount("");
  };

  const calculateRewards = () => {
    // 简单的奖励计算逻辑，例如每质押 1 单位获得 0.1 奖励
    setRewards(stakedAmount * 0.1);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">质押池</h2>
      <div className="mb-4">
        <label className="block mb-2">输入金额:</label>
        <input
          type="number"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
        />
      </div>
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleStake}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          质押
        </button>
        <button
          onClick={handleUnstake}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          解押
        </button>
      </div>
      <div className="mb-4">
        <button
          onClick={calculateRewards}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          计算奖励
        </button>
      </div>
      <div className="text-base text-gray-700">
        <p>已质押金额: {stakedAmount}</p>
        <p>奖励: {rewards}</p>
      </div>
    </div>
  );
};

export default StakingPage;
