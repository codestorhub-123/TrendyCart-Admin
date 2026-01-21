'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import TablePagination from '@mui/material/TablePagination'
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
import { toast } from 'react-hot-toast'
import moment from 'moment'

import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import CustomChip from '@core/components/mui/Chip'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { getAllSellerRequests, acceptOrNotSellerRequest } from '@/services/sellerRequestService'
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

const SellerRequestTable = () => {
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalRequests, setTotalRequests] = useState(0)

  const fetchData = async () => {
    setIsLoading(true)
    const page = pagination.pageIndex + 1
    const res = await getAllSellerRequests(page, pagination.pageSize)
    if (res && res.status === true) {
      setData(res.requests || res.data || [])
      setTotalRequests(res.totalRequests || res.total || 0)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize])

  const handleAction = async (id, action) => {
    try {
      const res = await acceptOrNotSellerRequest(id, action)
      if (res && res.status === true) {
        toast.success(res.message || `Request ${action}ed successfully`)
        fetchData()
      } else {
        toast.error(res.message || `Failed to ${action} request`)
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('no', {
        header: 'NO',
        cell: ({ row }) => <Typography>{row.index + 1 + pagination.pageIndex * pagination.pageSize}</Typography>,
        size: 50
      }),
      columnHelper.accessor('image', {
        header: 'IMAGE',
        cell: ({ row }) => {
          const name = `${row.original.firstName || ''}`.trim()
          return (
            <CustomAvatar
              src={row.original.image}
              alt={name}
              variant='rounded'
              skin='light'
              color='primary'
            >
              {getInitials(name)}
            </CustomAvatar>
          )
        },
        size: 80
      }),
      columnHelper.accessor('user', {
        header: 'USER',
        cell: ({ row }) => (
          <Typography className='font-medium'>
            {`${row.original.firstName || ''} ${row.original.lastName || ''}`.trim() || '-'}
          </Typography>
        ),
        size: 200
      }),
      columnHelper.accessor('businessName', {
        header: 'BUSINESS NAME',
        cell: ({ row }) => <Typography>{row.original.businessName || '-'}</Typography>,
        size: 150
      }),
      columnHelper.accessor('gender', {
        header: 'GENDER',
        cell: ({ row }) => <Typography>{row.original.gender || '-'}</Typography>,
        size: 100
      }),
      columnHelper.accessor('country', {
        header: 'COUNTRY',
        cell: ({ row }) => <Typography>{row.original.country || row.original.address?.country || '-'}</Typography>,
        size: 120
      }),
      columnHelper.accessor('accept', {
        header: 'ACCEPT',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Switch
              checked={false} // Since they are pending, we show them as untoggled
              onChange={(e) => {
                if (e.target.checked) {
                  handleAction(row.original._id, 'accept')
                }
              }}
            />
            <Tooltip title='Decline'>
              <IconButton size='small' onClick={() => handleAction(row.original._id, 'decline')}>
                <i className='tabler-x text-error' />
              </IconButton>
            </Tooltip>
          </div>
        ),
        size: 120
      }),
      columnHelper.accessor('createdAt', {
        header: 'CREATED DATE',
        cell: ({ row }) => <Typography>{moment(row.original.createdAt).format('DD MMM YYYY')}</Typography>,
        size: 150
      })
    ],
    [data, pagination]
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
    pageCount: Math.ceil(totalRequests / pagination.pageSize)
  })

  return (
    <Card>
      <CardHeader title='Pending Seller' />
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
                <td colSpan={columns.length} className='text-center'>No pending requests found</td>
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
        component={() => <TablePaginationComponent table={table} total={totalRequests} />}
        count={totalRequests}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageIndex}
        onPageChange={(_, page) => setPagination(prev => ({ ...prev, pageIndex: page }))}
        rowsPerPageOptions={[10, 25, 50]}
        onRowsPerPageChange={e => setPagination(prev => ({ ...prev, pageSize: parseInt(e.target.value, 10), pageIndex: 0 }))}
      />
    </Card>
  )
}

export default SellerRequestTable
