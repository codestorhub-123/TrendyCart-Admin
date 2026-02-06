'use client'

// React Imports
import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { useSelector } from 'react-redux'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import Link from '@components/Link'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Styled Components
const Icon = styled('i')({})

const columnHelper = createColumnHelper()

const OrderListTable = ({ orderData }) => {
  // States
  const [data, setData] = useState(orderData || [])
  const [statusFilter, setStatusFilter] = useState('All')

  // Hooks
  const { lang: locale } = useParams()
  const { currency } = useSelector(state => state.settingsReducer)

  const filteredData = useMemo(() => {
    if (statusFilter === 'All') return data

    return data.filter(order => order.items.some(item => (item.status === statusFilter || (statusFilter === 'Pending' && item.status === 0))))
  }, [data, statusFilter])

  const columns = useMemo(
    () => [
      {
        id: 'no',
        header: 'No',
        cell: info => info.row.index + 1
      },
      columnHelper.accessor('orderId', {
        header: 'Order Id',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original._id}`, locale)}
            color='primary'
            className='font-medium'
          >
            {row.original.orderId?.toString().startsWith('INV#') ? row.original.orderId : `INV#${row.original.orderId}`}
          </Typography>
        )
      }),
      columnHelper.accessor('items', {
        header: 'Items',
        cell: ({ row }) => {
          const filteredItems = row.original.items?.filter(
            item =>
              statusFilter === 'All' ||
              item.status === statusFilter ||
              (statusFilter === 'Pending' && item.status === 0)
          )

          return (
            <div className='flex flex-col gap-4'>
              {filteredItems?.map((item, index) => {
                const product = item?.productId

                return (
                  <div key={index} className='flex items-center gap-3 h-[60px]'>
                    <CustomAvatar src={product?.mainImage || '/images/avatars/1.png'} size={40} variant='rounded' />
                    <div className='flex flex-col items-start'>
                      <Typography color='text.primary' className='font-medium' variant='body2'>
                        {product?.productName || 'Unnamed Product'}
                      </Typography>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }
      }),
      columnHelper.accessor('finalTotal', {
        header: `Price (${currency})`,
        cell: ({ row }) => {
          const filteredItems = row.original.items?.filter(
            item =>
              statusFilter === 'All' ||
              item.status === statusFilter ||
              (statusFilter === 'Pending' && item.status === 0)
          )

          return (
            <div className='flex flex-col gap-4'>
              {filteredItems?.map((item, index) => (
                <div key={index} className='flex items-center justify-center h-[60px]'>
                  <Typography>{currency}{item.purchasedTimeProductPrice ?? 0}</Typography>
                </div>
              ))}
            </div>
          )
        }
      }),
      columnHelper.accessor('totalShippingCharges', {
        header: `Shipping Charge (${currency})`,
        cell: ({ row }) => {
          const filteredItems = row.original.items?.filter(
            item =>
              statusFilter === 'All' ||
              item.status === statusFilter ||
              (statusFilter === 'Pending' && item.status === 0)
          )

          return (
            <div className='flex flex-col gap-4'>
              {filteredItems?.map((item, index) => (
                <div key={index} className='flex items-center justify-center h-[60px]'>
                  <Typography>{currency}{item.purchasedTimeShippingCharges ?? 0}</Typography>
                </div>
              ))}
            </div>
          )
        }
      }),
      columnHelper.accessor('paymentStatus', {
        header: 'Payment Status',
        cell: ({ row }) => {
          const statusVal = row.original.paymentStatus
          const label = statusVal === 1 ? 'Cash on Delivery' : statusVal === 2 ? 'Paid' : 'Unknown'
          const color = statusVal === 1 ? 'warning' : statusVal === 2 ? 'success' : 'secondary'

          const filteredItems = row.original.items?.filter(
            item =>
              statusFilter === 'All' ||
              item.status === statusFilter ||
              (statusFilter === 'Pending' && item.status === 0)
          )

          return (
            <div className='flex flex-col gap-4'>
              {filteredItems?.map((_, index) => (
                <div key={index} className='flex items-center justify-center h-[60px]'>
                  <Chip size='small' label={label} color={color} variant='tonal' />
                </div>
              ))}
            </div>
          )
        }
      }),
      columnHelper.accessor('status', {
        header: 'Order Status',
        cell: ({ row }) => {
          const filteredItems = row.original.items?.filter(
            item =>
              statusFilter === 'All' ||
              item.status === statusFilter ||
              (statusFilter === 'Pending' && item.status === 0)
          )

          return (
            <div className='flex flex-col gap-4'>
              {filteredItems?.map((item, index) => {
                const status = item.status
                const label = status === 0 ? 'Pending' : status

                const color =
                  label === 'Delivered'
                    ? 'success'
                    : label === 'Cancelled'
                    ? 'error'
                    : label === 'Pending' || label === 0
                    ? 'warning'
                    : 'info'

                return (
                  <div key={index} className='flex items-center justify-center h-[60px]'>
                    <Chip size='small' label={label} color={color} variant='tonal' />
                  </div>
                )
              })}
            </div>
          )
        }
      })
    ],
    [statusFilter, currency, locale]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
        pagination: {
            pageSize: 10
        }
    }
  })

  return (
    <Card>
      <CardHeader
        title='Order Details'
        action={
          <FormControl size='small' className='min-is-[150px]'>
            <InputLabel id='status-filter-label'>All</InputLabel>
            <Select
              labelId='status-filter-label'
              value={statusFilter}
              label='All'
              onChange={e => setStatusFilter(e.target.value)}
            >
              <MenuItem value='All'>All</MenuItem>
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Confirmed'>Confirmed</MenuItem>
              <MenuItem value='Out Of Delivery'>Out Of Delivery</MenuItem>
              <MenuItem value='Delivered'>Delivered</MenuItem>
              <MenuItem value='Cancelled'>Cancelled</MenuItem>
            </Select>
          </FormControl>
        }
      />
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className='text-center'>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames('flex items-center justify-center', {
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <i className='tabler-chevron-up text-xl' />,
                          desc: <i className='tabler-chevron-down text-xl' />
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No Data Found!
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.map(row => {
                  return (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className='text-center'>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
    </Card>
  )
}

export default OrderListTable
