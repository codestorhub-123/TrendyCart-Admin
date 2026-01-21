'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
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
import TablePaginationComponent from '@components/TablePaginationComponent'
import { getRealSeller, blockUnblockSeller, updateSellerProfile, getProfileByAdmin } from '@/services/sellerService'
import { sendNotificationToSeller } from '@/services/notificationService'
import { getInitials } from '@/utils/getInitials'
import tableStyles from '@core/styles/table.module.css'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'

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


const EditSellerDialog = ({ open, handleClose, initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState(initialData)

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const handleSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSubmit(formData)
  }

  // Helper to update fields
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Stop propagation on dialog click to prevent bubbling to table
  const handleDialogClick = (e) => {
    e.stopPropagation()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='lg' fullWidth onClick={handleDialogClick} onKeyDown={(e) => e.stopPropagation()}>
      <DialogTitle>Edit Seller</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Divider textAlign='left'>Personal Info</Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='First Name' value={formData.firstName} onChange={e => handleFieldChange('firstName', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Last Name' value={formData.lastName} onChange={e => handleFieldChange('lastName', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Email' value={formData.email} onChange={e => handleFieldChange('email', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Mobile Number' value={formData.mobileNumber} onChange={e => handleFieldChange('mobileNumber', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
               <CustomTextField select fullWidth label='Gender' value={formData.gender} onChange={e => handleFieldChange('gender', e.target.value)}>
                 <MenuItem value='Male'>Male</MenuItem>
                 <MenuItem value='Female'>Female</MenuItem>
                 <MenuItem value='Other'>Other</MenuItem>
               </CustomTextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth type='file' label='Profile Image' onChange={e => handleFieldChange('image', e.target.files[0])} inputProps={{ accept: 'image/*' }} />
            </Grid>

            <Grid item xs={12}>
              <Divider textAlign='left'>Business Info</Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Business Name' value={formData.businessName} onChange={e => handleFieldChange('businessName', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Business Tag' value={formData.businessTag} onChange={e => handleFieldChange('businessTag', e.target.value)} />
            </Grid>

            <Grid item xs={12}>
              <Divider textAlign='left'>Address Info</Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Address' value={formData.address} onChange={e => handleFieldChange('address', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Landmark' value={formData.landMark} onChange={e => handleFieldChange('landMark', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='City' value={formData.city} onChange={e => handleFieldChange('city', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='State' value={formData.state} onChange={e => handleFieldChange('state', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Country' value={formData.country} onChange={e => handleFieldChange('country', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Pin Code' value={formData.pinCode} onChange={e => handleFieldChange('pinCode', e.target.value)} />
            </Grid>
            
            <Grid item xs={12}>
              <Divider textAlign='left'>Bank Info</Divider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Bank Name' value={formData.bankName} onChange={e => handleFieldChange('bankName', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Account Number' value={formData.accountNumber} onChange={e => handleFieldChange('accountNumber', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='IFSC Code' value={formData.IFSCCode} onChange={e => handleFieldChange('IFSCCode', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Branch Name' value={formData.branchName} onChange={e => handleFieldChange('branchName', e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField fullWidth label='Bank Business Name' value={formData.bankBusinessName} onChange={e => handleFieldChange('bankBusinessName', e.target.value)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={handleClose}>Cancel</Button>
          <Button variant='contained' type='submit' disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

const NotificationDialog = ({ open, handleClose, seller, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    image: null
  })

  useEffect(() => {
    if (open) {
      setFormData({ title: '', message: '', image: null })
    }
  }, [open, seller])

  const handleSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth onClick={e => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <DialogTitle>Send Notification to {seller?.firstName}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Title'
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                rows={4}
                label='Message'
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                type='file'
                label='Image'
                onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                inputProps={{ accept: 'image/*' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant='tonal' color='secondary' onClick={handleClose}>Cancel</Button>
          <Button variant='contained' type='submit' disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

const columnHelper = createColumnHelper()

const RealSellerTable = () => {
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalSellers, setTotalSellers] = useState(0)

  // Dialog States
  const [editOpen, setEditOpen] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    gender: '',
    businessName: '',
    businessTag: '',
    countryCode: '',
    address: '',
    landMark: '',
    city: '',
    pinCode: '',
    state: '',
    country: '',
    bankBusinessName: '',
    bankName: '',
    accountNumber: '',
    IFSCCode: '',
    branchName: '',
    image: null
  })

  // Notification Dialog States
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [selectedSellerForNotification, setSelectedSellerForNotification] = useState(null)
  const [notificationLoading, setNotificationLoading] = useState(false)


  const fetchData = async () => {
    setIsLoading(true)
    const page = pagination.pageIndex + 1
    const res = await getRealSeller(page, pagination.pageSize)
    if (res && res.status === true) {
      setData(res.data || res.sellers || [])
      setTotalSellers(res.total || res.totalSellers || 0)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize])

  const handleBlockAction = async (id) => {
    try {
      const res = await blockUnblockSeller(id)
      if (res && res.status === true) {
        toast.success(res.message || 'Seller status updated successfully')
        fetchData()
      } else {
        toast.error(res.message || 'Failed to update seller status')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }



  const handleOpenNotification = (seller) => {
    setSelectedSellerForNotification(seller)
    setNotificationOpen(true)
  }

  const handleCloseNotification = () => {
    setNotificationOpen(false)
    setSelectedSellerForNotification(null)
  }

  const handleSubmitNotification = async (data) => {
    if (!selectedSellerForNotification) return
    
    setNotificationLoading(true)
    const formData = new FormData()
    formData.append('sellerId', selectedSellerForNotification._id)
    formData.append('title', data.title)
    formData.append('message', data.message)
    if (data.image) {
      formData.append('image', data.image)
    }

    try {
      const res = await sendNotificationToSeller(formData)
      if (res && res.status === true) {
        toast.success(res.message || 'Notification sent successfully')
        handleCloseNotification()
      } else {
        toast.error(res.message || 'Failed to send notification')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setNotificationLoading(false)
    }
  }

  const handleOpenEdit = (seller) => {
    setSelectedSeller(seller)
    setFormData({
      firstName: seller.firstName || '',
      lastName: seller.lastName || '',
      email: seller.email || '',
      mobileNumber: seller.mobileNumber || '',
      gender: seller.gender || '',
      businessName: seller.businessName || '',
      businessTag: seller.businessTag || '',
      countryCode: seller.countryCode || '',
      address: seller.address || '',
      landMark: seller.landMark || '',
      city: seller.city || '',
      pinCode: seller.pinCode || '',
      state: seller.state || '',
      country: seller.country || '',
      bankBusinessName: seller.bankBusinessName || '',
      bankName: seller.bankName || '',
      accountNumber: seller.accountNumber || '',
      IFSCCode: seller.IFSCCode || '',
      branchName: seller.branchName || '',
      image: null
    })
    setEditOpen(true)
  }

  const handleCloseEdit = () => {
    setEditOpen(false)
    setSelectedSeller(null)
  }

  const handleSubmitEdit = async (dataToSubmit) => {
    setFormLoading(true)
    
    const data = new FormData()
    Object.keys(dataToSubmit).forEach(key => {
      if (dataToSubmit[key] !== null && dataToSubmit[key] !== undefined && dataToSubmit[key] !== '') {
        data.append(key, dataToSubmit[key])
      }
    })

    try {
      const res = await updateSellerProfile(selectedSeller._id, data)
      if (res && res.status === true) {
        toast.success(res.message || 'Seller updated successfully')
        handleCloseEdit()
        fetchData()
      } else {
        toast.error(res.message || 'Failed to update seller')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setFormLoading(false)
    }
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
          const name = `${row.original.firstName || ''}`.trim()
          return (
            <div className='flex items-center gap-3'>
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
              <Typography color='text.primary' className='font-medium'>
                {name || '-'}
              </Typography>
            </div>
          )
        },
        size: 200
      }),
      columnHelper.accessor('contact', {
        header: 'CONTACT',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography variant='body2' color='text.primary' className='font-medium'>{row.original.email || '-'}</Typography>
            <Typography variant='body2'>{row.original.mobileNumber || '-'}</Typography>
          </div>
        ),
        size: 200
      }),
      columnHelper.accessor('businessName', {
        header: 'BUSINESS NAME',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.businessName || '-'}</Typography>,
        size: 150
      }),
      columnHelper.accessor('businessTag', {
        header: 'BUSINESS TAG',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.businessTag || '-'}</Typography>,
        size: 120
      }),
      columnHelper.accessor('totalProduct', {
        header: 'TOTAL PRODUCT',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.totalProduct || 0}</Typography>,
        size: 120
      }),
      columnHelper.accessor('totalOrder', {
        header: 'TOTAL ORDER',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.totalOrder || 0}</Typography>,
        size: 120
      }),
      columnHelper.accessor('isBlock', {
        header: 'BLOCK',
        cell: ({ row }) => (
          <Switch
            checked={row.original.isBlock || false}
            onChange={(e) => {
              e.stopPropagation()
              handleBlockAction(row.original._id)
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        size: 100
      }),
      columnHelper.accessor('date', {
        header: 'CREATED DATE',
        cell: ({ row }) => <Typography>{row.original.date ? moment(row.original.date).format('DD MMM YYYY') : '-'}</Typography>,
        size: 150
      }),
      columnHelper.accessor('notification', {
        header: 'NOTIFICATION',
        cell: ({ row }) => (
          <IconButton 
            size='small'
            onClick={(e) => {
              e.stopPropagation()
              handleOpenNotification(row.original)
            }}
          >
            <i className='tabler-bell text-textSecondary' />
          </IconButton>
        ),
        size: 80
      }),
      columnHelper.accessor('edit', {
        header: 'EDIT',
        cell: ({ row }) => (
          <IconButton 
            size='small' 
            onClick={(e) => {
              e.stopPropagation()
              handleOpenEdit(row.original)
            }}
          >
            <i className='tabler-edit text-textSecondary' />
          </IconButton>
        ),
        size: 60
      }),
      columnHelper.accessor('info', {
        header: 'INFO',
        cell: ({ row }) => {
          const { lang: locale } = useParams()
          return (
            <IconButton size='small' component={Link} href={`/${locale}/apps/seller/real/${row.original._id}`}>
              <i className='tabler-eye text-textSecondary' />
            </IconButton>
          )
        },
        size: 60
      }),

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
    rowCount: totalSellers
  })

  return (
    <Card>
      <CardHeader title='Real Seller' />
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
                <td colSpan={columns.length} className='text-center'>No real sellers found</td>
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

      
      {/* Edit Dialog */}
      {selectedSeller && (
        <EditSellerDialog 
          open={editOpen} 
          handleClose={handleCloseEdit} 
          initialData={formData} 
          onSubmit={handleSubmitEdit} 
          isLoading={formLoading} 
        />
      )}

      {/* Notification Dialog */}
      {selectedSellerForNotification && (
        <NotificationDialog
          open={notificationOpen}
          handleClose={handleCloseNotification}
          seller={selectedSellerForNotification}
          onSubmit={handleSubmitNotification}
          isLoading={notificationLoading}
        />
      )}

    </Card>
  )
}

export default RealSellerTable
