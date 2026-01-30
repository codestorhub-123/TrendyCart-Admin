'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
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
import { getFakeSeller, toggleLiveOrNot, deleteSeller, createFakeSeller, updateFakeSellerProfile } from '@/services/sellerService'
import { getProductsBySeller } from '@/services/productService'
import { getInitials } from '@/utils/getInitials'
import { getImageUrl } from '@/utils/imageUrl'
import tableStyles from '@core/styles/table.module.css'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'

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

const FakeSellerTable = () => {
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalSellers, setTotalSellers] = useState(0)
  
  // Dialog State
  const [open, setOpen] = useState(false)
  const [editSeller, setEditSeller] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    gender: '',
    businessName: '',
    businessTag: '',
    image: null,
    video: null
  })
  const [formLoading, setFormLoading] = useState(false)

  // Video Preview State
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [activeVideo, setActiveVideo] = useState(null)

  // Live Dialog State
  const [liveDialogOpen, setLiveDialogOpen] = useState(false)
  const [selectedSellerForLive, setSelectedSellerForLive] = useState(null)
  const [sellerProducts, setSellerProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [liveLoading, setLiveLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    const page = pagination.pageIndex + 1
    const res = await getFakeSeller(page, pagination.pageSize)
    if (res && res.status === true) {
      setData(res.data || res.sellers || res.fakeSellers || [])
      setTotalSellers(res.total || res.totalSellers || 0)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize])

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this seller?')) {
      try {
        const res = await deleteSeller(id)
        if (res && res.status === true) {
          toast.success(res.message || 'Seller deleted successfully')
          setData([])
          setPagination(prev => ({ ...prev, pageIndex: 0 }))
          setTimeout(() => {
            fetchData()
          }, 800)
        } else {
          toast.error(res.message || 'Failed to delete seller')
        }
      } catch (error) {
        toast.error('An error occurred')
      }
    }
  }

  const handleOpenLiveDialog = async (seller) => {
    setSelectedSellerForLive(seller)
    setLiveDialogOpen(true)
    setSellerProducts([])
    setSelectedProduct('')
    
    // Fetch products for this seller
    try {
      const res = await getProductsBySeller(seller._id, 1, 100) 
      if (res && res.status === true) {
        // Broad fallbacks for product data structure
        const products = res.data?.products || res.products?.products || res.data || res.products || res.product || res.fakeProducts || []
        setSellerProducts(products)
      }
    } catch (error) {
      toast.error('Failed to fetch products')
    }
  }

  const handleCloseLiveDialog = () => {
    setLiveDialogOpen(false)
    setSelectedSellerForLive(null)
    setSellerProducts([])
    setSelectedProduct('')
  }

  const handleSubmitLive = async (e) => {
    e.preventDefault()
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }
    setLiveLoading(true)
    try {
      const res = await toggleLiveOrNot(selectedSellerForLive._id, selectedProduct)
      if (res && res.status === true) {
        toast.success(res.message || 'Seller is now live')
        handleCloseLiveDialog()
        fetchData()
      } else {
        toast.error(res.message || 'Failed to make seller live')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setLiveLoading(false)
    }
  }

  const handleLiveToggle = async (id) => {
    try {
      const res = await toggleLiveOrNot(id)
      if (res && res.status === true) {
        toast.success(res.message || 'Live status updated successfully')
        fetchData()
      } else {
        toast.error(res.message || 'Failed to update live status')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleOpenAddDialog = () => {
    setEditSeller(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      gender: '',
      businessName: '',
      businessTag: '',
      image: null,
      video: null
    })
    setOpen(true)
  }

  const handleOpenEditDialog = (seller) => {
    setEditSeller(seller)
    setFormData({
      firstName: seller.firstName || '',
      lastName: seller.lastName || '',
      email: seller.email || '',
      mobileNumber: seller.mobileNumber || '',
      gender: seller.gender || '',
      businessName: seller.businessName || '',
      businessTag: seller.businessTag || '',
      image: null,
      video: null
    })
    setOpen(true)
  }

  const handleCloseDialog = () => {
    setOpen(false)
    setEditSeller(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    
    const data = new FormData()
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        data.append(key, formData[key])
      }
    })

    try {
      let res
      if (editSeller) {
        res = await updateFakeSellerProfile(editSeller._id, data)
      } else {
        res = await createFakeSeller(data)
      }

      if (res && res.status === true) {
        toast.success(res.message || (editSeller ? 'Seller updated successfully' : 'Seller created successfully'))
        handleCloseDialog()
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
        fetchData()
      } else {
        toast.error(res.message || 'Something went wrong')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setFormLoading(false)
    }
  }

  const handleOpenVideo = (videoUrl) => {
    if (!videoUrl) {
      toast.error('No video available for this seller')
      return
    }
    setActiveVideo(videoUrl)
    setVideoDialogOpen(true)
  }

  const handleCloseVideo = () => {
    setVideoDialogOpen(false)
    setActiveVideo(null)
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
          const name = `${row.original.firstName || ''} ${row.original.lastName || ''}`.trim()
          return (
            <div className='flex items-center gap-3'>
              <CustomAvatar
                src={getImageUrl(row.original.image)}
                alt={name}
                variant='rounded'
                skin='light'
                color='primary'
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
      columnHelper.accessor('video', {
        header: 'VIDEO',
        cell: ({ row }) => (
          <IconButton 
            size='small' 
            color='secondary' 
            variant='tonal' 
            sx={{ borderRadius: 1, backgroundColor: 'rgba(75, 70, 92, 0.08)' }}
            onClick={() => handleOpenVideo(row.original.video)}
          >
            <i className='tabler-player-play-filled' />
          </IconButton>
        ),
        size: 80
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
      columnHelper.accessor('createdAt', {
        header: 'CREATED DATE',
        cell: ({ row }) => <Typography>{row.original.createdAt ? moment(row.original.createdAt).format('DD MMM YYYY') : '-'}</Typography>,
        size: 150
      }),
      columnHelper.accessor('onlive', {
        header: 'ONLIVE',
        cell: ({ row }) => (
          <IconButton size='small' onClick={() => handleOpenLiveDialog(row.original)}>
            <i className='tabler-device-tv' />
          </IconButton>
        ),
        size: 80
      }),
      columnHelper.accessor('offlive', {
        header: 'OFFLIVE',
        cell: ({ row }) => (
          <Button
            size='small'
            variant='contained'
            color={row.original.isLive ? 'error' : 'secondary'}
            startIcon={<i className={row.original.isLive ? 'tabler-video-off' : 'tabler-video'} />}
            onClick={() => {
              if (row.original.isLive) {
                handleLiveToggle(row.original._id)
              } else {
                handleOpenLiveDialog(row.original)
              }
            }}
            sx={{ minWidth: 100, borderRadius: 3, backgroundColor: row.original.isLive ? '#ea5455' : '#808390' }}
          >
            {row.original.isLive ? 'OffLive' : 'GoLive'}
          </Button>
        ),
        size: 140
      }),
      columnHelper.accessor('edit', {
        header: 'EDIT',
        cell: ({ row }) => (
          <IconButton size='small' onClick={() => handleOpenEditDialog(row.original)}>
            <i className='tabler-edit text-textSecondary' />
          </IconButton>
        ),
        size: 60
      }),
      columnHelper.accessor('delete', {
        header: 'DELETE',
        cell: ({ row }) => (
          <IconButton size='small' onClick={() => handleDelete(row.original._id)}>
            <i className='tabler-trash text-error' />
          </IconButton>
        ),
        size: 60
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
    rowCount: totalSellers
  })

  return (
    <Card>
      <CardHeader 
        title='Fake Seller' 
      />
      <div className='flex flex-wrap justify-between p-6 border-bs gap-4'>
        <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={handleOpenAddDialog}>
          Add
        </Button>
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
                <td colSpan={columns.length} className='text-center'>No fake sellers found</td>
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
      <Dialog open={open} onClose={handleCloseDialog} maxWidth='md' fullWidth>
        <DialogTitle>{editSeller ? 'Edit Fake Seller' : 'Add Fake Seller'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={5}>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='First Name'
                  placeholder='Enter first name'
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Last Name'
                  placeholder='Enter last name'
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Email'
                  placeholder='Enter email'
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Mobile Number'
                  placeholder='Enter mobile number'
                  value={formData.mobileNumber}
                  onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  select
                  fullWidth
                  label='Gender'
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  required
                >
                  <MenuItem value='Male'>Male</MenuItem>
                  <MenuItem value='Female'>Female</MenuItem>
                  <MenuItem value='Other'>Other</MenuItem>
                </CustomTextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Business Name'
                  placeholder='Enter business name'
                  value={formData.businessName}
                  onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  label='Business Tag'
                  placeholder='Enter business tag'
                  value={formData.businessTag}
                  onChange={e => setFormData({ ...formData, businessTag: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  type='file'
                  label='Avatar Image'
                  onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                  inputProps={{ accept: 'image/*' }}
                  {...(!editSeller && { required: true })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomTextField
                  fullWidth
                  type='file'
                  label='Seller Video'
                  onChange={e => setFormData({ ...formData, video: e.target.files[0] })}
                  inputProps={{ accept: 'video/*' }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant='tonal' color='secondary' onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button variant='contained' type='submit' disabled={formLoading}>
              {formLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={videoDialogOpen} onClose={handleCloseVideo} maxWidth='sm' fullWidth>
        <DialogTitle className='flex justify-between items-center'>
          Seller Video
          <IconButton onClick={handleCloseVideo}>
            <i className='tabler-x' />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className='flex justify-center bg-black rounded overflow-hidden'>
            {activeVideo && (
              <video 
                src={getImageUrl(activeVideo)} 
                className='max-w-full' 
                controls 
                autoPlay 
                style={{ maxHeight: '70vh' }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={liveDialogOpen} onClose={handleCloseLiveDialog} maxWidth='xs' fullWidth>
        <DialogTitle component='div' className='flex justify-between items-center'>
          <Typography variant='h5'>Live Seller</Typography>
          <IconButton onClick={handleCloseLiveDialog} size='small'>
            <i className='tabler-x' />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmitLive}>
          <DialogContent>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomTextField
                  fullWidth
                  label='Name'
                  value={`${selectedSellerForLive?.firstName || ''} ${selectedSellerForLive?.lastName || ''}`.trim()}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  select
                  fullWidth
                  label='Select Product'
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                  required
                >
                  <MenuItem value='' disabled>Select Product</MenuItem>
                  {sellerProducts.map(product => (
                    <MenuItem key={product._id} value={product._id}>
                      {product.productName}
                    </MenuItem>
                  ))}
                  {sellerProducts.length === 0 && (
                    <MenuItem disabled>No products found</MenuItem>
                  )}
                </CustomTextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions className='flex justify-end gap-2 p-6'>
            <Button variant='contained' type='submit' disabled={liveLoading}>
              {liveLoading ? 'Submitting...' : 'Submit'}
            </Button>
            <Button variant='tonal' color='secondary' onClick={handleCloseLiveDialog}>
              Close
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Card>
  )
}

export default FakeSellerTable
