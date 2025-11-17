import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'Closed': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        dot: 'bg-green-600',
      },
      'Open': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        dot: 'bg-yellow-600',
      },
      'In progress': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        dot: 'bg-blue-600',
      },
      'Awaiting agreement': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        dot: 'bg-yellow-600',
      },
      'Action required': {
        bg: 'bg-red-100',
        text: 'text-red-700',
        dot: 'bg-red-600',
      },
    };
    return configs[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      dot: 'bg-gray-600',
    };
  };

  const config = getStatusConfig(status);

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center ${config.bg} ${config.text} ${className}`}>
      <span className={`h-2 w-2 rounded-full mr-2 ${config.dot}`}></span>
      {status}
    </span>
  );
};

export default StatusBadge;