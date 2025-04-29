"use client";
import { useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { parseAbi, parseUnits, formatUnits } from "viem";
import { readContract } from "@wagmi/core";
import { config } from "@/wagmiConfig";
const aggregatorV3InterfaceABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
    name: "getRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    constants: true,
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];
const uniswapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"; // Uniswap V3 Router 地址
const uniswapRouterABI = parseAbi([
  "function exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160)) external payable returns (uint256)",
]);

// 预定义代币地址（以太坊主网）
const predefinedTokens = {
  ETH: "0x0000000000000000000000000000000000000000", // ETH
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
};

const TokenSwapPanelPage = () => {
  const { address } = useAccount(); // 获取用户钱包地址
  const [inputToken, setInputToken] = useState("ETH"); // 默认输入代币
  const [outputToken, setOutputToken] = useState("USDC"); // 默认输出代币
  const [amount, setAmount] = useState(""); // 输入金额
  const [swapResult, setSwapResult] = useState(""); // 兑换结果
  const [convertedAmount, setConvertedAmount] = useState(""); // 换算后的金额

  // 获取用户余额
  const { data: balanceData } = useBalance({
    address,
    token: inputToken === "ETH" ? undefined : predefinedTokens[inputToken],
  });
  const res = useReadContract({
    address: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
    abi: aggregatorV3InterfaceABI,
    functionName: "latestRoundData",
  });
  console.log("🚀 ~ getPrice ~ res:", res);
  // 模拟换算逻辑（实际应通过 Uniswap 或预言机获取实时价格）
  useEffect(() => {
    if (amount) {
      const rate = inputToken === "ETH" && outputToken === "USDC" ? 1800 : 1; // 假设 1 ETH = 1800 USDC
      // 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
      getPrice();
      setConvertedAmount((parseFloat(amount) * rate).toFixed(2));
    } else {
      setConvertedAmount("");
    }
  }, [amount, inputToken, outputToken]);

  const { data: hash, writeContract, isPending } = useWriteContract();

  const handleSwap = () => {
    if (!amount) {
      alert("请输入兑换金额");
      return;
    }
    sendTransaction();
  };

  const getPrice = async () => {
    const res = await readContract(config, {
      address: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
      abi: aggregatorV3InterfaceABI,
      functionName: "latestRoundData",
    });
    console.log("🚀 ~ getPrice ~ res:", res);
  };

  const sendTransaction = async () => {
    try {
      const res = await writeContract({
        address: uniswapRouterAddress,
        abi: uniswapRouterABI,
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn: predefinedTokens[inputToken],
            tokenOut: predefinedTokens[outputToken],
            fee: 3000, // 0.3% 池子
            recipient: address,
            deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 分钟后过期
            amountIn: parseUnits(amount || "0", 18),
            amountOutMinimum: 0, // 简化处理，实际应计算最小输出
            sqrtPriceLimitX96: 0,
          },
        ],
      });
      setSwapResult("交易已提交，请等待确认...");
    } catch (error) {
      console.error(error);
      setSwapResult("交易失败，请检查输入！");
    }
  };

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">代币兑换</h2>
      <div className="mb-4">
        <label className="block mb-2">输入代币:</label>
        <select
          value={inputToken}
          onChange={(e) => setInputToken(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
        >
          {Object.keys(predefinedTokens).map((token) => (
            <option key={token} value={token}>
              {token}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-400 mt-2">
          当前余额:{" "}
          {balanceData ? formatUnits(balanceData.value, 18) : "加载中..."}{" "}
          {inputToken}
        </p>
      </div>
      <div className="mb-4">
        <label className="block mb-2">输出代币:</label>
        <select
          value={outputToken}
          onChange={(e) => setOutputToken(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
        >
          {Object.keys(predefinedTokens).map((token) => (
            <option key={token} value={token}>
              {token}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">输入金额:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
          placeholder="输入兑换金额"
        />
        {convertedAmount && (
          <p className="text-sm text-gray-400 mt-2">
            预计获得: {convertedAmount} {outputToken}
            hash{hash}
          </p>
        )}
      </div>
      <button
        onClick={handleSwap}
        disabled={isPending}
        className={`${
          isPending ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
        } text-white px-4 py-2 rounded w-full`}
      >
        {isPending ? "处理中..." : "兑换"}
      </button>
      {swapResult && (
        <p className="mt-4 text-center text-lg font-semibold">{swapResult}</p>
      )}
    </div>
  );
};

export default TokenSwapPanelPage;
