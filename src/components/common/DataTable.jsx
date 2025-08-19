import { useState } from 'react';
import { Search, Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({
  data,
  columns,
  searchable = true,
  filterable = false,
  pageSize = 10,
  onRowClick,
  actions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
  ));

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  // Get mobile columns (first 4 columns)
  const mobileColumns = columns.slice(0, 4);
  const remainingColumns = columns.slice(4);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {(searchable || filterable) && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 gap-4 sm:flex sm:items-center sm:justify-between sm:gap-0">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-80 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            )}
            {filterable && (
              <button className="flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 w-full sm:w-auto">
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile View */}
      <div className="block">
        <div className="space-y-4 p-4">
          {paginatedData.map((row, index) => {
            const rowKey = row.id || index;
            return (
              <div key={rowKey} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {mobileColumns.map((column) => (
                      <div key={column.key}>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {column.label}
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => toggleRow(rowKey)}
                      className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {expandedRows[rowKey] ? (
                        <>
                          Réduire <ChevronUp className="ml-1 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Voir plus <ChevronDown className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {expandedRows[rowKey] && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                      {remainingColumns.map((column) => (
                        <div key={column.key}>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {column.label}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {actions && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-600 flex justify-end">
                        {actions(row)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {startIndex + 1} à {Math.min(startIndex + pageSize, filteredData.length)} sur {filteredData.length} résultats
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;