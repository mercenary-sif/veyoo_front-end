import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <div className="bg-nav rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-green-600 dark:text-green-400">
        <TrendingUp className="h-4 w-4 mr-1" />
        <span className="text-sm">{trend}</span>
      </div>
    )}
  </div>
);

export default StatCard;