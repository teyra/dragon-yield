"use client";
const TransactionHistoryPage = () => {
  return (
    <div className="p-4 bg-gray-700 text-white rounded">
      <h2 className="text-xl font-bold mb-4">交易历史</h2>
      <p>显示用户的交易记录。</p>
      {/* 使用 The Graph 查询交易历史 */}
    </div>
  );
};

export default TransactionHistoryPage;
