'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'

import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'
import Badge from '@mui/material/Badge'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { getLiveSellerList } from '@/services/liveSellerService'
import { getInitials } from '@/utils/getInitials'
import tableStyles from '@core/styles/table.module.css'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)
    return () => clearTimeout(timeout)
  }, [value])
  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper()

const LiveSellerTable = () => {
  const router = useRouter()
  const params = useParams()
  const { lang: locale } = params

  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalSellers, setTotalSellers] = useState(0)

  const fetchData = async () => {
    setIsLoading(true)
    const page = pagination.pageIndex + 1
    const res = await getLiveSellerList(page, pagination.pageSize)
    if (res && res.status === true) {
      setData(res.liveSeller || [])
      setTotalSellers(res.total || 0)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize])

  const handleShowProducts = (sellerId) => {
    router.push(`/${locale}/apps/seller/live/${sellerId}`)
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('no', {
        header: 'NO',
        cell: ({ row }) => <Typography>{row.index + 1 + pagination.pageIndex * pagination.pageSize}</Typography>,
        size: 50
      }),
      columnHelper.accessor('seller', {
        header: 'SELLER',
        cell: ({ row }) => {
          const imageUrl = row.original.image || '/images/avatars/1.png'
          const name = `${row.original.firstName || ''} `.trim()
          
          return (
            <div className='flex items-center gap-3'>
              <Badge
                overlap='rectangular'
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                
               
              >
                <CustomAvatar
                  src={row.original.image}
                  alt={name}
                  variant='rounded'
                  size={34}
                  sx={{
                    backgroundColor: 'var(--mui-palette-primary-lightOpacity)',
                    color: 'var(--mui-palette-primary-main)'
                  }}
                >
                  {getInitials(name)}
                </CustomAvatar>
              </Badge>
              <Typography className='font-medium'>{name || '-'}</Typography>
            </div>
          )
        },
        size: 200
      }),
      columnHelper.accessor('email', {
        header: 'EMAIL',
        cell: ({ row }) => <Typography>{row.original.email || '-'}</Typography>,
        size: 200
      }),
      columnHelper.accessor('mobileNumber', {
        header: 'CONTECT',
        cell: ({ row }) => <Typography>{row.original.mobileNumber || '-'}</Typography>,
        size: 150
      }),
      columnHelper.accessor('businessName', {
        header: 'BUSINESS NAME',
        cell: ({ row }) => <Typography>{row.original.businessName || '-'}</Typography>,
        size: 150
      }),
      columnHelper.accessor('businessTag', {
        header: 'BUSINESS TAG',
        cell: ({ row }) => <Typography>{row.original.businessTag || '-'}</Typography>,
        size: 120
      }),
      columnHelper.accessor('view', {
        header: 'VIEWS',
        cell: ({ row }) => <Typography>{row.original.view || 0}</Typography>,
        size: 80
      }),
      columnHelper.accessor('selectedProducts', {
        header: 'VIEW PRODUCT',
        cell: ({ row }) => (
          <Tooltip title='View Products'>
            <IconButton size='small' onClick={() => handleShowProducts(row.original._id)}>
              <i className='tabler-info-circle text-textSecondary' />
            </IconButton>
          </Tooltip>
        ),
        size: 120
      })
    ],
    [data, pagination, locale]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { 
      globalFilter,
      pagination
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: 'fuzzy',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalSellers / pagination.pageSize)
  })

  return (
    <Card>
      <CardHeader title='Live Seller' />
      <div className='flex justify-end p-6 border-bs gap-4'>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Searching for...'
          className='max-sm:is-full'
        />
      </div>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    <div
                      className={classnames({
                        'flex items-center': header.column.getCanSort(),
                        'cursor-pointer select-none': header.column.getCanSort()
                      })}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className='text-center'>Loading...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='text-center'>No live sellers found</td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        component={() => <TablePaginationComponent table={table} total={totalSellers} />}
        count={totalSellers}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageIndex}
        onPageChange={(_, page) => setPagination(prev => ({ ...prev, pageIndex: page }))}
        rowsPerPageOptions={[10, 25, 50]}
        onRowsPerPageChange={e => setPagination(prev => ({ ...prev, pageSize: parseInt(e.target.value, 10), pageIndex: 0 }))}
      />

    </Card>
  )
}

export default LiveSellerTable
