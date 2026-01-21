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
import CustomTextField from '@core/components/mui/TextField'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

// Service Imports
import { fetchHostRequests, updateHostRequestStatus, fetchAgencies } from '@/services/userService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

const HostRequestListTable = () => {
  // States
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [declineReason, setDeclineReason] = useState({})
  const [showReasonInput, setShowReasonInput] = useState({})
  const [agencies, setAgencies] = useState([])
  const [agencyFrom, setAgencyFrom] = useState(1)
  const [agencyPagination, setAgencyPagination] = useState({ hasNext: false, hasPrev: false })
  const [showAgencyModal, setShowAgencyModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedAgencyCode, setSelectedAgencyCode] = useState('')
  const [selectedAgencyName, setSelectedAgencyName] = useState('')
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')

  const agencyItemsPerPage = 10

  // Fetch host requests
  const fetchRequestsData = async () => {
    try {
      setLoading(true)
      const data = await fetchHostRequests()
      setRequests(data)
    } catch (err) {
      console.error('Failed to fetch host requests:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch agencies list
  const fetchAgenciesList = async (fromVal = 1, toVal = 10) => {
    try {
      const data = await fetchAgencies(fromVal, toVal)
      setAgencies(data.agencies || [])
      setAgencyPagination(data.pagination || { hasNext: false, hasPrev: false })
      setAgencyFrom(fromVal)
    } catch (err) {
      console.error('Failed to fetch agencies:', err)
    }
  }

  // Agency pagination handlers
  const handleAgencyPrev = () => {
    if (agencyPagination.hasPrev && agencyFrom > 1) {
      const newFrom = Math.max(1, agencyFrom - agencyItemsPerPage)
      fetchAgenciesList(newFrom, newFrom + agencyItemsPerPage - 1)
    }
  }

  const handleAgencyNext = () => {
    if (agencyPagination.hasNext) {
      const newFrom = agencyFrom + agencyItemsPerPage
      fetchAgenciesList(newFrom, newFrom + agencyItemsPerPage - 1)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchRequestsData()
  }, [])

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showAgencyModal || showImageModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showAgencyModal, showImageModal])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (showAgencyDropdown && !event.target.closest('.agency-dropdown-container')) {
        setShowAgencyDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAgencyDropdown])

  // Handle approve click
  const handleApproveClick = request => {
    if (request.agencyCode) {
      handleAction(request._id, 'approved', request.agencyCode)
    } else {
      setSelectedRequest(request)
      setSelectedAgencyCode('')
      setSelectedAgencyName('')
      setShowAgencyDropdown(false)
      setAgencyFrom(1)
      fetchAgenciesList(1, 10)
      setShowAgencyModal(true)
    }
  }

  // Handle select agency
  const handleSelectAgency = (agencyCode, agencyName) => {
    setSelectedAgencyCode(agencyCode)
    setSelectedAgencyName(agencyName)
    setShowAgencyDropdown(false)
  }

  // Handle action (approve/reject)
  const handleAction = async (requestId, action, agencyCode = null) => {
    try {
      const body = { action }
      if (agencyCode) body.agencyCode = agencyCode
      if (action === 'rejected') {
        body.reason = declineReason[requestId] || ''
      }
      await updateHostRequestStatus(requestId, body)
      setShowAgencyModal(false)
      setSelectedAgencyCode('')
      setSelectedRequest(null)
      fetchRequestsData()
    } catch (err) {
      console.error('Action failed:', err)
    }
  }

  // Handle image click
  const handleImageClick = imageUrl => {
    setSelectedImage(imageUrl)
    setShowImageModal(true)
    document.body.style.overflow = 'hidden'
  }

  // Handle close image modal
  const handleCloseImageModal = () => {
    setShowImageModal(false)
    document.body.style.overflow = 'unset'
  }

  // Filter requests
  const filteredRequests = requests.filter(r => r.hostStatus === filter)

  // Get image URL
  const getImageUrl = imagePath => {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    // Remove /api/v1 if present for static files
    let baseUrl = API_BASE.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '')
    const cleanPath = imagePath.replace(/^\/+/, '')
    return `${baseUrl}/${cleanPath}`
  }

  return (
    <>
      <Card>
        {/* Header */}
        <div className='p-6 border-bs'>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div>
              <Typography variant='h4' className='mbe-1'>
                Host Requests
              </Typography>
              {/* <Typography>Manage and monitor all host requests</Typography> */}
            </div>
            <div className='flex items-center gap-2'>
              <Typography variant='body2' className='text-textSecondary'>
                Total Requests:
              </Typography>
              <Typography variant='h6'>{filteredRequests.length}</Typography>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className='p-6 border-bs flex gap-4'>
          {['pending', 'approved', 'rejected'].map(status => (
            <Button
              key={status}
              variant={filter === status ? 'contained' : 'outlined'}
              onClick={() => setFilter(status)}
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
          ) : filteredRequests.length === 0 ? (
            <Typography className='text-center text-textSecondary py-20'>No {filter} host requests found.</Typography>
          ) : (
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Host</th>
                    <th>Telegram ID</th>
                    <th>Images</th>
                    <th>Status</th>
                    <th>Agency Code</th>
                    <th>Languages</th>
                    <th>Date</th>
                    {filter === 'pending' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((item, index) => (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>
                        <Typography className='font-medium'>{item.userId?.name || item.userId || '-'}</Typography>
                      </td>
                      <td>
                        <Typography>{item.telegramId || '-'}</Typography>
                      </td>
                      <td>
                        <div className='flex gap-1'>
                          {item.image && item.image.length > 0 ? (
                            item.image.slice(0, 3).map((img, imgIndex) => {
                              const imageUrl = getImageUrl(img)
                              return imageUrl ? (
                                <img
                                  key={imgIndex}
                                  src={imageUrl}
                                  alt={`Host image ${imgIndex + 1}`}
                                  className='w-10 h-10 rounded cursor-pointer hover:opacity-80 transition-opacity object-cover'
                                  onClick={() => handleImageClick(imageUrl)}
                                />
                              ) : null
                            })
                          ) : (
                            <Typography variant='body2' className='text-textSecondary'>
                              No images
                            </Typography>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.hostStatus === 'approved'
                              ? 'bg-success/10 text-success'
                              : item.hostStatus === 'rejected'
                                ? 'bg-error/10 text-error'
                                : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {item.hostStatus}
                        </span>
                      </td>
                      <td>
                        <Typography>{item.agencyCode || '-'}</Typography>
                      </td>
                      <td>
                        <Typography>
                          {item.languages && item.languages.length > 0 ? item.languages.join(', ') : '-'}
                        </Typography>
                      </td>
                      <td>
                        <Typography>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</Typography>
                      </td>
                      {filter === 'pending' && (
                        <td>
                          <div className='flex flex-col gap-2'>
                            <Button
                              variant='contained'
                              size='small'
                              color='primary'
                              onClick={() => handleApproveClick(item)}
                            >
                              Approve
                            </Button>
                            {showReasonInput[item._id] ? (
                              <div className='space-y-2'>
                                <CustomTextField
                                  fullWidth
                                  size='small'
                                  placeholder='Reason for decline'
                                  value={declineReason[item._id] || ''}
                                  onChange={e =>
                                    setDeclineReason(prev => ({
                                      ...prev,
                                      [item._id]: e.target.value
                                    }))
                                  }
                                />
                                <Button
                                  variant='contained'
                                  size='small'
                                  color='error'
                                  fullWidth
                                  onClick={() => handleAction(item._id, 'rejected')}
                                >
                                  Confirm Decline
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant='outlined'
                                size='small'
                                color='error'
                                onClick={() =>
                                  setShowReasonInput(prev => ({
                                    ...prev,
                                    [item._id]: true
                                  }))
                                }
                              >
                                Decline
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Agency Modal */}
      <Dialog open={showAgencyModal} onClose={() => setShowAgencyModal(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Assign Agency</DialogTitle>
        <DialogContent>
          <div className='mt-4'>
            {/* Custom Dropdown */}
            <div className='relative agency-dropdown-container'>
              <Button
                fullWidth
                variant='outlined'
                onClick={() => setShowAgencyDropdown(!showAgencyDropdown)}
                endIcon={<i className={`tabler-chevron-${showAgencyDropdown ? 'up' : 'down'}`} />}
                className='justify-between'
              >
                {selectedAgencyCode ? `${selectedAgencyName} (${selectedAgencyCode})` : '-- Select an agency --'}
              </Button>

              {/* Dropdown List */}
              {showAgencyDropdown && (
                <div className='absolute z-10 w-full mt-1 bg-backgroundPaper border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto'>
                  {agencies.length === 0 ? (
                    <div className='px-3 py-2 text-textSecondary text-sm'>No agencies available</div>
                  ) : (
                    <>
                      {agencies.map(agency => (
                        <div
                          key={agency._id}
                          onClick={() => handleSelectAgency(agency.code, agency.name)}
                          className={`px-3 py-2 cursor-pointer hover:bg-actionHover transition-colors ${
                            selectedAgencyCode === agency.code ? 'bg-actionSelected' : ''
                          }`}
                        >
                          <Typography variant='body2'>
                            {agency.name} ({agency.code})
                          </Typography>
                        </div>
                      ))}
                      {/* Pagination Controls */}
                      <div className='flex justify-center gap-2 p-2 border-t border-border bg-backgroundPaper sticky bottom-0'>
                        <IconButton
                          size='small'
                          onClick={e => {
                            e.stopPropagation()
                            handleAgencyPrev()
                          }}
                          disabled={!agencyPagination.hasPrev || agencyFrom === 1}
                        >
                          <i className='tabler-chevron-left' />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={e => {
                            e.stopPropagation()
                            handleAgencyNext()
                          }}
                          disabled={!agencyPagination.hasNext}
                        >
                          <i className='tabler-chevron-right' />
                        </IconButton>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAgencyModal(false)}>Cancel</Button>
          <Button
            variant='contained'
            onClick={() => {
              if (selectedAgencyCode) {
                handleAction(selectedRequest._id, 'approved', selectedAgencyCode)
              }
            }}
            disabled={!selectedAgencyCode}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={showImageModal} onClose={handleCloseImageModal} maxWidth='lg' fullWidth>
        <DialogContent className='p-0'>
          <div className='relative'>
            <IconButton className='absolute top-4 right-4 z-10 bg-backgroundPaper' onClick={handleCloseImageModal}>
              <i className='tabler-x' />
            </IconButton>
            <img
              src={selectedImage}
              alt='Host Request Image'
              className='w-full h-auto rounded-lg'
              style={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default HostRequestListTable
