'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileSpreadsheet, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Column {
  key: string
  label: string
  width?: string
  format?: (value: any) => React.ReactNode
}

interface DatabaseTableViewProps {
  title: string
  data: any[]
  columns: Column[]
  onExport?: () => void
  onAdd?: () => void
  onEdit?: (item: any) => void
  onDelete?: (id: string) => void
  loading?: boolean
}

export function DatabaseTableView({
  title,
  data,
  columns,
  onExport,
  onAdd,
  onEdit,
  onDelete,
  loading = false
}: DatabaseTableViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 20

  const filteredData = data.filter(item => {
    if (!searchQuery) return true
    return Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getRowId = (item: any, index: number) => {
    return item.id || item.orderNumber || `${title}-${index}`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-600">Total {filteredData.length} data</p>
        </div>
        <div className="flex gap-2">
          {onExport && (
            <Button
              onClick={onExport}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          )}
          {onAdd && (
            <Button
              onClick={onAdd}
              className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
            >
              Tambah Data
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-white rounded-lg border border-gray-200 p-3">
        <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <Input
          placeholder="Cari data..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-none focus-visible:ring-0 px-0"
        />
        <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Memuat data...
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Tidak ada data ditemukan
          </div>
        ) : (
          <>
            {/* Table Header - Fixed */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-gray-200 sticky top-0">
              <div className="grid grid-cols-[auto_1fr_auto] gap-2 px-4 py-3">
                <div className="w-8"></div>
                <div className="grid grid-cols-1 gap-2" style={{
                  gridTemplateColumns: columns.map(col => col.width || 'minmax(120px, 1fr)').join(' ')
                }}>
                  {columns.map((column) => (
                    <div
                      key={column.key}
                      className="text-xs font-semibold text-gray-700 uppercase tracking-wide"
                    >
                      {column.label}
                    </div>
                  ))}
                </div>
                <div className="w-20"></div>
              </div>
            </div>

            {/* Table Body - Scrollable */}
            <div className="max-h-[600px] overflow-y-auto">
              {paginatedData.map((item, index) => (
                <motion.div
                  key={getRowId(item, index)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="grid grid-cols-[auto_1fr_auto] gap-2 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors items-center"
                >
                  {/* Row Number */}
                  <div className="w-8 text-sm text-gray-500 font-medium">
                    {startIndex + index + 1}
                  </div>

                  {/* Data Columns */}
                  <div className="grid grid-cols-1 gap-2" style={{
                    gridTemplateColumns: columns.map(col => col.width || 'minmax(120px, 1fr)').join(' ')
                  }}>
                    {columns.map((column) => (
                      <div key={`${getRowId(item, index)}-${column.key}`} className="text-sm">
                        {column.format ? column.format(item[column.key]) : item[column.key]}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="w-20 flex gap-2">
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="h-8 px-2 text-xs"
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredData.length)} dari {filteredData.length} data
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600 px-3">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
