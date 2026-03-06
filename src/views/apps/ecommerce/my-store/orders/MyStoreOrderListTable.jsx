'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { getAdminOwnOrders, updateOrder } from '@/services/orderService'
import { getInitials } from '@/utils/getInitials'
import { getImageUrl } from '@/utils/imageUrl'
import { getLocalizedUrl } from '@/utils/i18n'
import tableStyles from '@core/styles/table.module.css'

export const statusChipColor = {
  Delivered: 'success',
  Cancelled: 'error',
  Pending: 'info',
  Confirmed: 'success',
  'Out For Delivery': 'warning'
}

const columnHelper = createColumnHelper()

const MyStoreOrderListTable = () => {
  const [data, setData] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [trackingInfo, setTrackingInfo] = useState({
    deliveredServiceName: '',
    trackingId: '',
    trackingLink: ''
  })

  const { lang: locale } = useParams()

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  const fetching = useRef(false)

  const fetchOrders = async () => {
    if (fetching.current) return
    fetching.current = true
    setLoading(true)
    try {
      const res = await getAdminOwnOrders(pagination.pageIndex + 1, pagination.pageSize, statusFilter)
      if (res.status) {
        const formattedData = (res.orders || []).map((order, index) => ({
          ...order,
          itemData: {
            ...order.item,
            productId: {
              ...order.product,
              _id: order.item?.productId
            },
            deliveredServiceName: order.item?.deliveredServiceName || '',
            trackingId: order.item?.trackingId || '',
            trackingLink: order.item?.trackingLink || ''
          },
          orderRowIndex: (pagination.pageIndex * pagination.pageSize) + index + 1
        }))
        setData(formattedData)
        setTotalCount(res.total || 0)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      fetching.current = false
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [pagination.pageIndex, pagination.pageSize, statusFilter])

  const handleStatusChange = (val) => {
    setStatusFilter(val)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  const handleEdit = (row) => {
    setSelectedOrder(row)
    const currentStatus = row.itemData?.status || row.status || 'Pending'
    const options = getStatusOptions(currentStatus)
    
    // Default to the next status if available, otherwise stay on current
    setNewStatus(options.length > 1 ? options[1] : currentStatus)
    
    setTrackingInfo({
      deliveredServiceName: row.itemData?.deliveredServiceName || '',
      trackingId: row.itemData?.trackingId || '',
      trackingLink: row.itemData?.trackingLink || ''
    })
    setEditDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return

    if (newStatus === 'Out For Delivery') {
      if (!trackingInfo.deliveredServiceName || !trackingInfo.trackingId) {
        alert('Service Name and Tracking ID are required for Out For Delivery')
        return
      }
    }

    setUpdateLoading(true)
    try {
      const res = await updateOrder({
        orderId: selectedOrder._id,
        itemId: selectedOrder.itemData?._id,
        status: newStatus,
        deliveredServiceName: trackingInfo.deliveredServiceName,
        trackingId: trackingInfo.trackingId,
        trackingLink: trackingInfo.trackingLink
      })

      if (res.status) {
        setEditDialogOpen(false)
        fetchOrders()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdateLoading(false)
    }
  }

  const getStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'Pending':
        return ['Pending', 'Confirmed', 'Cancelled']
      case 'Confirmed':
        return ['Confirmed', 'Out For Delivery', 'Cancelled']
      case 'Out For Delivery':
        return ['Out For Delivery', 'Delivered', 'Cancelled']
      case 'Delivered':
        return ['Delivered']
      case 'Cancelled':
        return ['Cancelled']
      default:
        return [currentStatus, 'Pending', 'Confirmed', 'Out For Delivery', 'Delivered', 'Cancelled']
    }
  }

  const columns = useMemo(
    () => [
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
      columnHelper.accessor('itemData', {
        header: 'PRODUCT',
        cell: ({ row }) => {
          const item = row.original.itemData
          return (
            <div className='flex items-center gap-3'>
              <CustomAvatar
                src={getImageUrl(item?.productId?.mainImage)}
                variant='rounded'
                skin='light'
                size={34}
              >
                {getInitials(item?.productId?.productName || 'Product')}
              </CustomAvatar>
              <div className='flex flex-col'>
                <Typography variant='body2' className='font-bold text-textPrimary truncate max-is-[150px]' title={item?.productId?.productName}>
                  {item?.productId?.productName || 'Unnamed'}
                </Typography>
                <Typography variant='caption'>
                  Qty: {item?.productQuantity || 1}
                </Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('status', {
        header: 'STATUS',
        cell: ({ row }) => {
          const status = row.original.itemData?.status || 'Pending'
          return (
            <Chip
              label={status}
              color={statusChipColor[status] || 'primary'}
              variant='tonal'
              size='small'
            />
          )
        }
      }),
      columnHelper.accessor('action', {
        header: 'ACTION',
        cell: ({ row }) => (
          <Button
            variant='tonal'
            size='small'
            startIcon={<i className='tabler-edit' />}
            onClick={() => handleEdit(row.original)}
            disabled={row.original.itemData?.status === 'Delivered' || row.original.itemData?.status === 'Cancelled'}
          >
            Update
          </Button>
        )
      })
    ],
    [locale]
  )

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: totalCount,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardHeader title='Admin Orders' />
      <div className='flex justify-between items-center pli-6 pb-4'>
        <CustomTextField
          select
          value={statusFilter}
          onChange={e => handleStatusChange(e.target.value)}
          className='is-[200px]'
        >
          <MenuItem value='All'>All Status</MenuItem>
          <MenuItem value='Pending'>Pending</MenuItem>
          <MenuItem value='Confirmed'>Confirmed</MenuItem>
          <MenuItem value='Out For Delivery'>Out For Delivery</MenuItem>
          <MenuItem value='Delivered'>Delivered</MenuItem>
          <MenuItem value='Cancelled'>Cancelled</MenuItem>
        </CustomTextField>
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
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={totalCount}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <div className='pt-4 flex flex-col gap-4'>
            <CustomTextField
              select
              fullWidth
              label='Status'
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
            >
              {getStatusOptions(selectedOrder?.itemData?.status || 'Pending').map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </CustomTextField>

            {newStatus === 'Out For Delivery' && (
              <>
                <CustomTextField
                  fullWidth
                  label='Service Name'
                  required
                  value={trackingInfo.deliveredServiceName}
                  onChange={e => setTrackingInfo(prev => ({ ...prev, deliveredServiceName: e.target.value }))}
                />
                <CustomTextField
                  fullWidth
                  label='Tracking ID'
                  required
                  value={trackingInfo.trackingId}
                  onChange={e => setTrackingInfo(prev => ({ ...prev, trackingId: e.target.value }))}
                />
                <CustomTextField
                  fullWidth
                  label='Tracking Link'
                  value={trackingInfo.trackingLink}
                  onChange={e => setTrackingInfo(prev => ({ ...prev, trackingLink: e.target.value }))}
                />
              </>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={handleUpdateStatus} disabled={updateLoading}>
            {updateLoading ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default MyStoreOrderListTable
