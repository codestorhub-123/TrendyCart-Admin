'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import TablePagination from '@mui/material/TablePagination'
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
import { toast } from 'react-hot-toast'
import moment from 'moment'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

import CustomAvatar from '@core/components/mui/Avatar'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { listWithdrawalRequests, approveWithdrawalRequest, rejectWithdrawalRequest } from '@/services/withdrawRequestService'
import { getInitials } from '@/utils/getInitials'
import tableStyles from '@core/styles/table.module.css'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CustomTextField from '@core/components/mui/TextField'
import Grid from '@mui/material/Grid'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper()

const RejectDialog = ({ open, handleClose, onSubmit, isLoading }) => {
  const [reason, setReason] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSubmit(reason)
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth onClick={e => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <DialogTitle>Reject Withdrawal Request</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
            <CustomTextField
              fullWidth
              multiline
              rows={4}
              label='Reason'
              placeholder='Enter rejection reason...'
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={handleClose}>Cancel</Button>
          <Button variant='contained' color='error' type='submit' disabled={isLoading}>
            {isLoading ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

const WithdrawalTable = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalRequests, setTotalRequests] = useState(0)
  const [statusType, setStatusType] = useState('1') // 1=Pending, 2=Approved, 3=Rejected
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  // Action States
  const [rejectOpen, setRejectOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    const page = pagination.pageIndex + 1
    const startStr = startDate ? moment(startDate).format('YYYY-MM-DD') : 'All'
    const endStr = endDate ? moment(endDate).format('YYYY-MM-DD') : 'All'
    
    const res = await listWithdrawalRequests(page, pagination.pageSize, statusType, startStr, endStr)
    if (res && res.status === true) {
      setData(res.data || []) // Adjust based on actual API response structure
      setTotalRequests(res.total || 0)
    } else {
        setData([])
        setTotalRequests(0)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (startDate && !endDate) return
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize, statusType, startDate, endDate])

  const handleTabChange = (type) => {
    setStatusType(type)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  const handleApprove = async (id) => {
    if(confirm('Are you sure you want to approve this request?')) {
        setActionLoading(true)
        try {
            const res = await approveWithdrawalRequest(id)
            if (res && res.status === true) {
                toast.success(res.message || 'Request approved successfully')
                fetchData()
            } else {
                toast.error(res.message || 'Failed to approve request')
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setActionLoading(false)
        }
    }
  }

  const handleOpenReject = (request) => {
    setSelectedRequest(request)
    setRejectOpen(true)
  }

  const handleCloseReject = () => {
    setRejectOpen(false)
    setSelectedRequest(null)
  }

  const handleRejectSubmit = async (reason) => {
    if (!selectedRequest) return
    setActionLoading(true)
    try {
        const res = await rejectWithdrawalRequest(selectedRequest._id, reason)
        if (res && res.status === true) {
            toast.success(res.message || 'Request rejected successfully')
            handleCloseReject()
            fetchData()
        } else {
            toast.error(res.message || 'Failed to reject request')
        }
    } catch (error) {
        toast.error('An error occurred')
    } finally {
        setActionLoading(false)
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('no', {
        header: 'NO',
        cell: ({ row }) => <Typography>{row.index + 1 + pagination.pageIndex * pagination.pageSize}</Typography>,
        size: 50
      }),
      columnHelper.accessor('uniqueId', {
        header: 'UNIQUE ID',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.uniqueId || row.original.sellerId?.uniqueId || '-'}</Typography>,
        size: 150
      }),
      columnHelper.accessor('seller', {
        header: 'SELLER',
        cell: ({ row }) => {
          const seller = row.original.sellerId || {}
          const name = `${seller.firstName || ''}`.trim()
          return (
            <div className='flex items-center gap-3'>
              <CustomAvatar
                src={seller.image || undefined}
                alt={name}
                variant='rounded'
                skin='light'
                color='primary'
              >
                {getInitials(name)}
              </CustomAvatar>
              <div className='flex flex-col'>
                <Typography color='text.primary' className='font-medium'>
                    {name || '-'}
                </Typography>
                <Typography variant='body2'>{seller.businessName || ''}</Typography>
              </div>
            </div>
          )
        },
        size: 250
      }),
      columnHelper.accessor('amount', {
        header: 'AMOUNT',
        cell: ({ row }) => <Typography color='text.primary' className='font-medium'>{row.original.amount || 0}</Typography>,
        size: 100
      }),
      columnHelper.accessor('paymentGateway', {
        header: 'PAYMENT GATEWAY',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.paymentGateway || '-'}</Typography>,
        size: 200
      }),
      columnHelper.accessor('date', {
        header: statusType === '1' ? 'REQUESTED DATE' : (statusType === '2' ? 'ACCEPTED DATE' : 'REJECTED DATE'),
        cell: ({ row }) => {
            const date = statusType === '1' ? row.original.createdAt : (statusType === '2' ? row.original.acceptOrDeclineDate : row.original.acceptOrDeclineDate)
            return <Typography>{date ? moment(date).format('DD MMM YYYY') : '-'}</Typography>
        },
        size: 150
      }),
      ...(statusType === '3' ? [
        columnHelper.accessor('reason', {
            header: 'REASON',
            cell: ({ row }) => <Typography color='text.secondary'>{row.original.reason || '-'}</Typography>,
            size: 200
        })
      ] : []),
      // Only show actions for Pending tab
      ...(statusType === '1' ? [
          columnHelper.display({
            id: 'actions',
            header: 'ACTIONS',
            cell: ({ row }) => (
              <div className='flex gap-2'>
                <Button variant='contained' color='success' size='small' onClick={() => handleApprove(row.original._id)} disabled={actionLoading}>
                   Approve
                </Button>
                <Button variant='contained' color='error' size='small' onClick={() => handleOpenReject(row.original)} disabled={actionLoading}>
                   Reject
                </Button>
              </div>
            ),
            size: 200
          })
      ] : [])
    ],
    [data, pagination, statusType, actionLoading]
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
    rowCount: totalRequests
  })

  return (
    <Card>
      <CardHeader 
        title='Seller Withdrawal' 
        action={
            <AppReactDatepicker
              selectsRange
              endDate={endDate}
              selected={startDate}
              startDate={startDate}
              id='date-range-picker'
              placeholderText='Select Date'
              onChange={(dates) => {
                const [start, end] = dates
                setStartDate(start)
                setEndDate(end)
              }}
              customInput={<CustomTextField placeholder='Select Date' fullWidth />}
            />
        }
      />
      
      <div className='flex p-6 border-bs gap-2'>
        <div className='flex gap-2'>
            <Button 
                variant={statusType === '1' ? 'contained' : 'tonal'} 
                color={statusType === '1' ? 'primary' : 'secondary'}
                onClick={() => handleTabChange('1')}
            >
                Pending
            </Button>
            <Button 
                variant={statusType === '2' ? 'contained' : 'tonal'} 
                color={statusType === '2' ? 'primary' : 'secondary'}
                onClick={() => handleTabChange('2')}
            >
                Accepted
            </Button>
            <Button 
                variant={statusType === '3' ? 'contained' : 'tonal'} 
                color={statusType === '3' ? 'primary' : 'secondary'}
                onClick={() => handleTabChange('3')}
            >
                Declined
            </Button>
        </div>
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
                <td colSpan={columns.length} className='text-center'>No requests found</td>
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

      <RejectDialog 
        open={rejectOpen} 
        handleClose={handleCloseReject} 
        onSubmit={handleRejectSubmit} 
        isLoading={actionLoading} 
      />

    </Card>
  )
}

export default WithdrawalTable
