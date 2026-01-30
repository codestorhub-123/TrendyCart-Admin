'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { getImageUrl } from '@/utils/imageUrl'

import { getRealReels, deleteReel } from '@/services/reelService'
import { format } from 'date-fns'

import tableStyles from '@core/styles/table.module.css'
import ProductVideoDialog from '../fake/ProductVideoDialog'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)
  useEffect(() => { setValue(initialValue) }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => { onChange(value) }, debounce)
    return () => clearTimeout(timeout)
  }, [value])
  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper()

const RealReelTable = () => {
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Dialog State
  const [openView, setOpenView] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState('')

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await getRealReels()
      if (res && res.status) {
        setData(res.data || res.reels || []) 
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this reel?')) {
        const res = await deleteReel(id)
        if (res.status) {
            fetchData()
        } else {
            alert(res.message || 'Delete failed')
        }
    }
  }

  const handleInfo = (reel) => {
      // Use the first product if available
      const product = reel.products?.[0] || null
      setSelectedProduct(product)
      setSelectedVideo(reel.video)
      setOpenView(true)
  }

  const columns = useMemo(() => [
    columnHelper.accessor('rowNumber', {
        header: 'NO',
        cell: info => info.row.index + 1
    }),
    columnHelper.accessor('video', {
        header: 'VIDEO',
        cell: ({ row }) => {
            const thumbnail = row.original.thumbnail
            return (
                <div className="w-[50px] h-[50px] flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                     {thumbnail ? (
                        <img src={getImageUrl(thumbnail)} alt="thumbnail" className="w-full h-full object-cover" />
                    ) : (
                         <i className="tabler-video text-xl text-gray-400" />
                    )}
                </div>
            )
        }
    }),
    columnHelper.accessor('sellerId', {
        header: 'SELLER',
        cell: info => {
            const seller = info.getValue()
            if (!seller) return '-'
            return `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || '-'
        }
    }),
    columnHelper.accessor('sellerId.businessName', {
        header: 'BUSINESS NAME',
        cell: info => info.getValue() || '-'
    }),
    columnHelper.accessor('sellerId.businessTag', {
        header: 'BUSINESS TAG',
        cell: info => info.getValue() || '-'
    }),
    columnHelper.accessor('like', {
        header: 'LIKE',
        cell: info => info.getValue() || 0
    }),
    columnHelper.accessor('createdAt', {
        header: 'CREATED DATE',
        cell: info => info.getValue() ? format(new Date(info.getValue()), 'dd-MM-yyyy') : '-'
    }),
    columnHelper.display({
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
             <IconButton onClick={() => handleDelete(row.original._id)}>
                <i className='tabler-trash text-error' />
            </IconButton>
             <IconButton onClick={() => handleInfo(row.original)}>
                <i className='tabler-info-circle text-textSecondary' />
            </IconButton>
        </div>
      )
    })
  ], [])

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter
  })

  return (
    <Card>
      <div className='flex flex-wrap justify-between gap-4 p-5'>
        <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Searching for...'
            className='is-full sm:is-auto'
        />
      </div>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
                <tr>
                    <td colSpan={columns.length} className='text-center border-be-0 p-10'>
                        <Typography color='text.secondary'>No Data Found !</Typography>
                    </td>
                </tr>
            ) : (
                table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                    ))}
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      <TablePaginationComponent table={table} />

      {openView && (
          <ProductVideoDialog 
            open={openView}
            handleClose={() => setOpenView(false)}
            productData={selectedProduct}
            videoUrl={selectedVideo}
          />
      )}
    </Card>
  )
}

export default RealReelTable
