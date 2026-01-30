'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
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
import moment from 'moment'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import CustomTextField from '@core/components/mui/TextField'

import CustomAvatar from '@core/components/mui/Avatar'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { fetchAdminEarnings } from '@/services/earningService'
import { getImageUrl } from '@/utils/imageUrl'
import { getInitials } from '@/utils/getInitials'
import tableStyles from '@core/styles/table.module.css'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper()

const AdminEarningTable = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [totalHistory, setTotalHistory] = useState(0)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const fetchData = async () => {
    setIsLoading(true)
    const page = pagination.pageIndex + 1
    const startStr = startDate ? moment(startDate).format('DD-MM-YYYY') : 'All'
    const endStr = endDate ? moment(endDate).format('DD-MM-YYYY') : 'All'

    const res = await fetchAdminEarnings(page, pagination.pageSize, startStr, endStr)
    if (res && res.status === true) {
      setData(res.data || [])
      setTotalHistory(res.total || 0)
      setTotalEarnings(res.totalAdminEarnings || 0)
    } else {
        setData([])
        setTotalHistory(0)
        setTotalEarnings(0)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (startDate && !endDate) return
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize, startDate, endDate])

  const columns = useMemo(
    () => [
      columnHelper.accessor('no', {
        header: 'NO',
        cell: ({ row }) => <Typography>{row.index + 1 + pagination.pageIndex * pagination.pageSize}</Typography>,
        size: 50
      }),
      columnHelper.accessor('orderId', {
        header: 'ORDER ID',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.orderId || '-'}</Typography>,
        size: 150
      }),
      columnHelper.accessor('product', {
        header: 'PRODUCT',
        cell: ({ row }) => {
            const { productName, productImage } = row.original
            return (
                <div className='flex items-center gap-3'>
                    <CustomAvatar 
                      src={getImageUrl(productImage)} 
                      variant='rounded' 
                      size={34}
                      skin='light'
                      color='primary'
                    >
                      {getInitials(productName || '-')}
                    </CustomAvatar>
                    <Typography color='text.primary'>{productName || '-'}</Typography>
                </div>
            )
        },
        size: 200
      }),
      columnHelper.accessor('sellerName', {
        header: 'SELLER NAME',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.sellerName || '-'}</Typography>,
        size: 150
      }),
      columnHelper.accessor('businessName', {
        header: 'BUSINESS NAME',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.businessName || '-'}</Typography>,
        size: 150
      }),
      columnHelper.accessor('businessTag', {
        header: 'BUSINESS TAG',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.businessTag || '-'}</Typography>,
        size: 150
      }),
      columnHelper.accessor('sellerEarning', {
        header: 'SELLER EARNING ()',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.amount || 0}</Typography>,
        size: 150
      }),
      columnHelper.accessor('adminEarning', {
        header: 'ADMIN EARNING ()',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.commissionPerProductQuantity || 0}</Typography>,
        size: 150
      }),
      columnHelper.accessor('date', {
        header: 'DATE AND TIME',
        cell: ({ row }) => <Typography>{row.original.date ? moment(row.original.date).format('DD MMM YYYY') : '-'}</Typography>,
        size: 200
      })
    ],
    [data, pagination]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    rowCount: totalHistory
  })

  return (
    <Card>
      <CardHeader 
        title='Admin Earning' 
        action={
            <AppReactDatepicker
              selectsRange
              endDate={endDate}
              selected={startDate}
              startDate={startDate}
              id='date-range-picker'
              placeholderText='Select Date'
              dateFormat='dd MMM yyyy'
              onChange={(dates) => {
                const [start, end] = dates
                setStartDate(start)
                setEndDate(end)
              }}
              customInput={<CustomTextField placeholder='Select Date' fullWidth />}
            />
        }
      />
      <div className='p-6 border-bs'>
        <Typography variant='h6'>Total Admin Earning : {totalEarnings}</Typography>
      </div>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
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
                <td colSpan={columns.length} className='text-center'>No earnings found</td>
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
        component={() => <TablePaginationComponent table={table} total={totalHistory} />}
        count={totalHistory}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageIndex}
        onPageChange={(_, page) => setPagination(prev => ({ ...prev, pageIndex: page }))}
        rowsPerPageOptions={[10, 25, 50]}
        onRowsPerPageChange={e => setPagination(prev => ({ ...prev, pageSize: parseInt(e.target.value, 10), pageIndex: 0 }))}
      />
    </Card>
  )
}

export default AdminEarningTable
