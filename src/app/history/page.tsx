"use client";

import { useEffect, useState } from "react";
import { createClient, gql, cacheExchange, fetchExchange } from "urql";

const TransactionHistoryPage = () => {
  type Pool = {
    id: string;
    token0: {
      symbol: string;
      name: string;
    };
    token1: {
      symbol: string;
      name: string;
    };
    volumeUSD: string;
    totalValueLockedUSD: string;
    feeTier: number;
    createdAtTimestamp: number;
  };
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0); // 当前页
  const itemsPerPage = 10; // 每页显示的项目数

  useEffect(() => {
    // 查询交易对数据
    const apiKey = process.env.NEXT_PUBLIC_GRAPH_API_KEY;
    const client = createClient({
      url: "https://gateway.thegraph.com/api/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV",
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
      exchanges: [cacheExchange, fetchExchange],
    });

    // 扩展 GraphQL 查询以获取更多字段
    const DATA_QUERY = gql`
      query GetPools($first: Int!, $skip: Int!) {
        pools(
          first: $first
          skip: $skip
          orderBy: volumeUSD
          orderDirection: desc
        ) {
          id
          token0 {
            symbol
            name
          }
          token1 {
            symbol
            name
          }
          volumeUSD
          totalValueLockedUSD
          feeTier
          createdAtTimestamp
        }
      }
    `;
    const fetchPools = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await client
          .query(DATA_QUERY, { first: itemsPerPage, skip: page * itemsPerPage })
          .toPromise();
        const data = response.data;
        console.log("🚀 ~ fetchPools ~ data:", data);
        if (data && data.pools) {
          setPools(data.pools);
        } else {
          setError("未找到数据");
        }
      } catch (err) {
        setError("查询数据时出错");
        console.error("Error fetching pools:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPools();
  }, [page]); // 当页码变化时重新加载数据

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePreviousPage = () => setPage((prev) => Math.max(prev - 1, 0));

  if (loading) {
    return (
      <div className="p-4 bg-gray-700 text-white rounded">
        <h2 className="text-xl font-bold mb-4">加载中...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-700 text-white rounded">
        <h2 className="text-xl font-bold mb-4">错误</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 text-white rounded">
      <h2 className="text-2xl font-bold mb-6">Uniswap 交易对历史</h2>
      <table className="w-full table-auto border-collapse border border-gray-600">
        <thead>
          <tr className="bg-gray-700">
            <th className="border border-gray-600 px-4 py-2">交易对</th>
            <th className="border border-gray-600 px-4 py-2">Token0 名称</th>
            <th className="border border-gray-600 px-4 py-2">Token1 名称</th>
            <th className="border border-gray-600 px-4 py-2">手续费等级</th>
            <th className="border border-gray-600 px-4 py-2">交易量 (USD)</th>
            <th className="border border-gray-600 px-4 py-2">锁仓量 (USD)</th>
            <th className="border border-gray-600 px-4 py-2">创建时间</th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <tr key={pool.id} className="hover:bg-gray-700">
              <td className="border border-gray-600 px-4 py-2">
                {pool.token0.symbol} / {pool.token1.symbol}
              </td>
              <td className="border border-gray-600 px-4 py-2">
                {pool.token0.name}
              </td>
              <td className="border border-gray-600 px-4 py-2">
                {pool.token1.name}
              </td>
              <td className="border border-gray-600 px-4 py-2">
                {pool.feeTier / 10000}%
              </td>
              <td className="border border-gray-600 px-4 py-2">
                ${parseFloat(pool.volumeUSD).toFixed(2)}
              </td>
              <td className="border border-gray-600 px-4 py-2">
                ${parseFloat(pool.totalValueLockedUSD).toFixed(2)}
              </td>
              <td className="border border-gray-600 px-4 py-2">
                {new Date(pool.createdAtTimestamp * 1000).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={page === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          上一页
        </button>
        <button
          onClick={handleNextPage}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          下一页
        </button>
      </div>
    </div>
  );
};

export default TransactionHistoryPage;
