import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../ui';

const TransactionCard = ({ transaction }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/deal-details/${transaction.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="grid grid-cols-6 gap-4 items-center border-t border-gray-100 px-4 py-4 text-sm cursor-pointer hover:bg-indigo-50 transition"
    >
      <div className="font-semibold text-gray-800">{transaction.id}</div>
      <div>
        <div className="font-medium text-slate-800">{transaction.assetType}</div>
        <div className="text-gray-500 text-xs">{transaction.title}</div>
      </div>
      <div className="text-gray-600">{transaction.created}</div>
      <div className="font-semibold text-gray-800">
        {transaction.amount}
        <span className="text-gray-400 text-xs ml-1">{transaction.currency}</span>
      </div>
      <div className="text-gray-700">{transaction.role}</div>

      {/* Status */}
      <div className="flex flex-col gap-1">
        <StatusBadge status={transaction.status} />

        {transaction.requiresAction && (
          <StatusBadge status="Action required" />
        )}
      </div>

      {/* Mobile stacked view labels */}
      <div className="block sm:hidden col-span-full text-xs text-gray-400 mt-2 border-t pt-2">
        Created: {transaction.created} • {transaction.amount} {transaction.currency}
      </div>
    </div>
  );
};

export default TransactionCard;