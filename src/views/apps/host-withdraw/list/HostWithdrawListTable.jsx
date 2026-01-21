'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import CustomTextField from '@core/components/mui/TextField'

// Service Imports
import { getWithdrawals, handleWithdrawAction } from '@/services/userService'

// Toast Imports
import { toast } from 'react-toastify'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const HostWithdrawListTable = () => {
  // States
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('pending')
  const [declineReason, setDeclineReason] = useState('')
  const [declineId, setDeclineId] = useState(null)
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)

  const statusMap = {
    pending: 1,
    approved: 2,
    declined: 3
  }

  // Fetch withdrawals
  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      const data = await getWithdrawals({ status: statusMap[tab], type: 'host' })
      // Sort by createdAt descending (newest first)
      const sortedWithdrawals = Array.isArray(data)
        ? [...data].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAt || 0).getTime()
            return dateB - dateA // Descending order (newest first)
          })
        : data || []
      setWithdrawals(sortedWithdrawals)
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch withdrawals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [tab])

  // Handle approve
  const handleApprove = async withdrawId => {
    try {
      await handleWithdrawAction(withdrawId, 2, undefined, 'host')
      toast.success('Request approved successfully')
      fetchWithdrawals()
    } catch (err) {
      console.error(err)
      toast.error('Approval failed')
    }
  }

  // Handle decline
  const handleDecline = withdrawId => {
    setDeclineId(withdrawId)
    setDeclineReason('')
    setDeclineDialogOpen(true)
  }

  // Submit decline
  const submitDecline = async () => {
    if (!declineReason.trim()) {
      toast.error('Please enter a reason for decline')
      return
    }
    try {
      await handleWithdrawAction(declineId, 3, declineReason, 'host')
      toast.success('Request declined successfully')
      setDeclineId(null)
      setDeclineReason('')
      setDeclineDialogOpen(false)
      fetchWithdrawals()
    } catch (err) {
      console.error(err)
      toast.error('Decline failed')
    }
  }

  // Format date
  const formatDate = date => (date ? new Date(date).toLocaleString() : '-')

  // Get status label
  const getStatusLabel = status => {
    if (status === 2) return 'Approved'
    if (status === 3) return 'Declined'
    return 'Pending'
  }

  // Get status color
  const getStatusColor = status => {
    if (status === 2) return 'success'
    if (status === 3) return 'error'
    return 'warning'
  }

  return (
    <>
      <Card>
        {/* Header */}
        <div className='p-6 border-bs'>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div>
              <Typography variant='h4' className='mbe-1'>
                Host Withdraw Requests
              </Typography>
              {/* <Typography>Manage and monitor all host withdrawal requests</Typography> */}
            </div>
            <div className='flex items-center gap-2'>
              <Typography variant='body2' className='text-textSecondary'>
                Total Requests:
              </Typography>
              <Typography variant='h6'>{withdrawals.length}</Typography>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className='p-6 border-bs flex gap-4'>
          {['pending', 'approved', 'declined'].map(status => (
            <Button
              key={status}
              variant={tab === status ? 'contained' : 'outlined'}
              onClick={() => setTab(status)}
              className='capitalize'
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Table */}
        <div className='p-6'>
          {loading ? (
            <div className='flex justify-center items-center py-20'>
              <CircularProgress />
            </div>
          ) : withdrawals.length === 0 ? (
            <Typography className='text-center text-textSecondary py-20'>No requests found</Typography>
          ) : (
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>Host Name</th>
                    <th>Host Email</th>
                    <th className='text-right'>Coins</th>
                    <th className='text-right'>Withdraw Rs</th>
                    <th className='text-center'>Status</th>
                    <th>Request Date</th>
                    <th>Approved/Declined Date</th>
                    <th className='text-center'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map(w => (
                    <tr key={w._id}>
                      <td>
                        <Typography>{w.hostId?.name || '-'}</Typography>
                      </td>
                      <td>
                        <Typography>{w.hostId?.email || '-'}</Typography>
                      </td>
                      <td className='text-right'>
                        <Typography>{w.coins || 0}</Typography>
                      </td>
                      <td className='text-right'>
                        <Typography>{w.withdrawRs || '-'}</Typography>
                      </td>
                      <td className='text-center'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            w.status === 2
                              ? 'bg-success/10 text-success'
                              : w.status === 3
                                ? 'bg-error/10 text-error'
                                : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {getStatusLabel(w.status)}
                        </span>
                      </td>
                      <td>
                        <Typography variant='body2'>{formatDate(w.createdAt)}</Typography>
                      </td>
                      <td>
                        <Typography variant='body2'>{formatDate(w.acceptDeclineDate)}</Typography>
                      </td>
                      <td className='text-center'>
                        {w.status === 1 ? (
                          <div className='flex justify-center gap-2'>
                            <Button
                              variant='contained'
                              size='small'
                              color='success'
                              onClick={() => handleApprove(w._id)}
                            >
                              Approve
                            </Button>
                            <Button variant='contained' size='small' color='error' onClick={() => handleDecline(w._id)}>
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <Typography variant='body2' className='text-textSecondary'>
                            -
                          </Typography>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Decline Reason Dialog */}
      <Dialog open={declineDialogOpen} onClose={() => setDeclineDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Decline Request</DialogTitle>
        <DialogContent>
          <Typography variant='body2' className='text-textSecondary mb-4'>
            Please provide a reason for declining this request
          </Typography>
          <CustomTextField
            fullWidth
            multiline
            rows={4}
            placeholder='Enter decline reason...'
            value={declineReason}
            onChange={e => setDeclineReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeclineDialogOpen(false)}>Cancel</Button>
          <Button variant='contained' color='error' onClick={submitDecline} disabled={!declineReason.trim()}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default HostWithdrawListTable
