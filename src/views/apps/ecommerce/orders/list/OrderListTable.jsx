'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Service Imports
import { getOrders, updateOrder } from '@/services/orderService'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

export const paymentStatus = {
  1: { text: 'Cash On Delivery', color: 'success', colorClassName: 'text-success' },
  2: { text: 'Paid', color: 'info', colorClassName: 'text-info' }
}

export const statusChipColor = {
  Delivered: 'success',
  Cancelled: 'error',
  Pending: 'info',
  Confirmed: 'success',
  'Out For Delivery': 'warning',
  'Manual Auction Pending Payment': 'warning',
  'Manual Auction Cancelled': 'error',
  'Auction Pending Payment': 'warning',
  'Auction Cancelled': 'error'
}

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Column Definitions
const columnHelper = createColumnHelper()

const OrderListTable = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Edit Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  // Hooks
  const { lang: locale } = useParams()

  const fetchOrders = async (pageIndex, pageSize, search, status) => {
    setLoading(true)
    try {
      const res = await getOrders(pageIndex + 1, pageSize, search, status)
      if (res.status) {
        // Flatten orders to show each item as a separate row
        const flattenedData = (res.data || []).flatMap((order, orderIndex) => {
          return (order.items || []).map(item => ({
            ...order,
            itemData: item,
            orderRowIndex: (pagination.pageIndex * pagination.pageSize) + orderIndex + 1
          }))
        })
        setData(flattenedData)
        setTotalCount(res.total || 0)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (row) => {
    setSelectedOrder(row)
    setNewStatus(row.itemData?.status || row.status || 'Pending')
    setEditDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return

    setUpdateLoading(true)
    try {
      const res = await updateOrder({
        orderId: selectedOrder._id,
        itemId: selectedOrder.itemData?._id,
        status: newStatus
      })

      if (res.status) {
        setEditDialogOpen(false)
        // Refresh data
        fetchOrders(pagination.pageIndex, pagination.pageSize, globalFilter, statusFilter)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdateLoading(false)
    }
  }

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  useEffect(() => {
    fetchOrders(pagination.pageIndex, pagination.pageSize, globalFilter, statusFilter)
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, statusFilter])

  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [globalFilter, statusFilter])

  // Vars
  const paypal = '/images/apps/ecommerce/paypal.png'
  const mastercard = '/images/apps/ecommerce/mastercard.png'

  const columns = useMemo(
    () => [
      {
        id: 'no',
        header: 'NO',
        cell: ({ row }) => (
          <Typography color='text.primary'>
            {row.original.orderRowIndex}
          </Typography>
        )
      },
      columnHelper.accessor('orderId', {
        header: 'ORDER ID',
        cell: ({ row }) => (
            <Typography
              component={Link}
              href={getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original._id}`, locale)}
              color='primary.main'
              className='font-medium'
            >
              {row.original.orderId?.toString().startsWith('INV#') ? row.original.orderId : `INV#${row.original.orderId}`}
            </Typography>
        )
      }),
      columnHelper.accessor('userId', {
        header: 'USER INFO',
        cell: ({ row }) => {
          const user = row.original.userId
          return (
            <div className='flex items-center gap-3'>
              {getAvatar({ avatar: user?.image, customer: user?.firstName || user?.name })}
              <div className='flex flex-col'>
                <Typography
                  component={Link}
                  href={getLocalizedUrl(`/apps/user/view/${user?._id}`, locale)}
                  color='text.primary'
                  className='font-medium hover:text-primary'
                >
                  {user?.firstName || user?.name || 'N/A'}
                </Typography>
                <Typography variant='body2' className='mt-1'>
                  uniqueId : ({user?.uniqueId || user?._id || 'N/A'})
                </Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('itemData', {
        header: 'ITEMS',
        cell: ({ row }) => {
          const item = row.original.itemData
          return (
            <div className='flex items-center gap-3'>
              <CustomAvatar
                src={item?.productId?.mainImage}
                alt={item?.productId?.productName}
                variant='rounded'
                skin='light'
                color='primary'
                size={34}
              >
                {getInitials(item?.productId?.productName || 'Product')}
              </CustomAvatar>
              <div className='flex flex-col'>
                <Typography variant='body2' className='font-bold text-textPrimary truncate max-is-[150px]' title={item?.productId?.productName}>
                  {item?.productId?.productName || 'Unnamed'}
                </Typography>
                <Typography variant='caption' className='text-textSecondary'>
                  Quantity: {item?.totalQuantity || item?.itemQuantity || 0}
                </Typography>
                <Typography variant='caption' className='text-textSecondary'>
                  Price: {item?.purchasedTimeProductPrice || 0}
                </Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('price', {
        header: 'PRICE',
        cell: ({ row }) => (
          <Typography variant='body2' className='font-medium'>
            {row.original.itemData?.purchasedTimeProductPrice || 0}
          </Typography>
        )
      }),
      columnHelper.accessor('shipping', {
        header: 'SHIPPING CHARGE',
        cell: ({ row }) => (
          <Typography variant='body2' className='font-medium'>
            {row.original.itemData?.purchasedTimeShippingCharges || 0}
          </Typography>
        )
      }),
      columnHelper.accessor('adminCommission', {
        header: 'ADMIN COMMISSION',
        cell: ({ row }) => (
          <Typography variant='body2' className='font-medium'>
            {row.original.itemData?.commissionPerProductQuantity || 0}
          </Typography>
        )
      }),
      columnHelper.accessor('paymentStatus', {
        header: 'PAYMENT STATUS',
        cell: ({ row }) => {
          const statusVal = row.original.paymentStatus || 1
          const status = paymentStatus[statusVal] || paymentStatus[1]

          return (
            <Chip
              label={status.text}
              color={status.color}
              variant='tonal'
              size='small'
            />
          )
        }
      }),
      columnHelper.accessor('finalTotal', {
        header: 'TOTAL',
        cell: ({ row }) => <Typography color='text.primary' className='font-medium'>{row.original.finalTotal}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'ORDER STATUS',
        cell: ({ row }) => {
          let status = (row.original.itemData?.status !== undefined && row.original.itemData?.status !== null) 
            ? row.original.itemData.status 
            : (row.original.status !== undefined && row.original.status !== null) ? row.original.status : 'Pending'
          
          const label = status === 0 ? 'Pending' : status
          return (
            <Chip
              label={label}
              color={statusChipColor[label] || 'primary'}
              variant='tonal'
              size='small'
            />
          )
        }
      }),
      columnHelper.accessor('action', {
        header: 'EDIT',
        cell: ({ row }) => {
          let status = (row.original.itemData?.status !== undefined && row.original.itemData?.status !== null) 
            ? row.original.itemData.status 
            : (row.original.status !== undefined && row.original.status !== null) ? row.original.status : 'Pending'
          
          if (status === 0) status = 'Pending'
          const color = statusChipColor[status] || 'primary'
          
          return (
            <div className='flex items-center'>
              <IconButton
                variant='tonal'
                color={color}
                size='small'
                className='rounded'
                onClick={() => handleEdit(row.original)}
              >
                <i className={classnames(
                  status === 'Confirmed' ? 'tabler-package-export' : 
                  status === 'Cancelled' ? 'tabler-package-off' : 
                  'tabler-package'
                )} />
              </IconButton>
              {/* <IconButton
                component={Link}
                href={getLocalizedUrl(`/apps/ecommerce/orders/details/${row.original._id}`, locale)}
                size='small'
              >
                <i className='tabler-eye text-textSecondary' />
              </IconButton> */}
            </div>
          )
        },
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter,
      pagination
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: totalCount,
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const getAvatar = params => {
    const { avatar, customer } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(customer || 'Unknown')}
        </CustomAvatar>
      )
    }
  }

  return (
    <Card>
      <CardHeader title='Orders' className='pbe-4' />
      <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-4'>
        <div className='flex items-center gap-4 flex-wrap'>
          <CustomTextField
            select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='is-[250px]'
            slotProps={{
              select: { displayEmpty: true }
            }}
          >
            <MenuItem value='All'>Select Status</MenuItem>
            <MenuItem value='Pending'>Pending</MenuItem>
            <MenuItem value='Confirmed'>Confirmed</MenuItem>
            <MenuItem value='Out For Delivery'>Out For Delivery</MenuItem>
            <MenuItem value='Delivered'>Delivered</MenuItem>
            <MenuItem value='Cancelled'>Cancelled</MenuItem>
            <MenuItem value='Manual Auction Pending Payment'>Manual Auction Pending Payment</MenuItem>
            <MenuItem value='Manual Auction Cancelled'>Manual Auction Cancelled</MenuItem>
            <MenuItem value='Auction Pending Payment'>Auction Pending Payment</MenuItem>
            <MenuItem value='Auction Cancelled'>Auction Cancelled</MenuItem>
          </CustomTextField>
        </div>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Searching for...'
          className='sm:is-auto'
        />
      </div>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
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
                      </>
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
                  No data available
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={totalCount}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
      />

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth='sm'
        fullWidth
        aria-labelledby='edit-order-dialog-title'
      >
        <DialogTitle id='edit-order-dialog-title' className='flex justify-between items-center'>
          <Typography variant='h5' component='span' className='font-medium'>Edit Order</Typography>
          <IconButton onClick={() => setEditDialogOpen(false)} size='small'>
            <i className='tabler-x text-2xl' />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className='pb-4 pbs-4'>
            <Typography variant='body2' className='mbe-2 text-textSecondary'>Edit Order</Typography>
            <CustomTextField
              select
              fullWidth
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              slotProps={{
                select: { 
                  displayEmpty: true,
                  style: { padding: '12px 16px' }
                }
              }}
            >
              <MenuItem value='Pending'>Pending</MenuItem>
              <MenuItem value='Confirmed'>Confirmed</MenuItem>
              <MenuItem value='Out For Delivery'>Out For Delivery</MenuItem>
              <MenuItem value='Delivered'>Delivered</MenuItem>
              <MenuItem value='Cancelled'>Cancelled</MenuItem>
            </CustomTextField>
          </div>
        </DialogContent>
        <DialogActions className='justify-end pli-6 pbe-6'>
          <Button
            variant='contained'
            onClick={handleUpdateStatus}
            disabled={updateLoading}
            className='min-is-[100px]'
          >
            {updateLoading ? 'Wait...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default OrderListTable
