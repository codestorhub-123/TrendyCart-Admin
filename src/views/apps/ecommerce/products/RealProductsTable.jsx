'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import CustomAvatar from '@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
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
import { useSelector } from 'react-redux'

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { getRealProducts, toggleNewCollection, toggleOutOfStock, updateProduct, deleteProduct } from '@/services/productService'
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

const RealProductsTable = () => {
  const router = useRouter()
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const { currency } = useSelector(state => state.settingsReducer)
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalPages, setTotalPages] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editFormData, setEditFormData] = useState({
    productName: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    shippingCharges: '',
    productCode: '',
    productSaleType: 0,
    quantity: 0,
    attributes: '',
    seller: '',
    mainImage: null,
    images: []
  })
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    const start = pagination.pageIndex + 1
    console.log('Fetching real products with start:', start, 'limit:', pagination.pageSize)
    const res = await getRealProducts(start, pagination.pageSize)
    console.log('Real Products API Response:', res)
    if (res && res.status === true) {
      setData(res.product || res.products || res.data || [])
      setTotalPages(res.totalPages || 0)
      setTotalProducts(res.totalProducts || 0)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [pagination.pageIndex, pagination.pageSize, refreshKey])

  const handleEdit = (product) => {
    setEditProduct(product)
    
    // Convert attributes format: change 'key' to 'name' for API
    let attributesString = '[]'
    if (product.attributes && product.attributes.length > 0) {
      const formattedAttributes = product.attributes.map(attr => ({
        name: attr.key || attr.name,
        values: attr.values
      }))
      attributesString = JSON.stringify(formattedAttributes)
    }
    
    setEditFormData({
      productName: product.productName || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category?._id || '',
      subCategory: product.subCategory?._id || '',
      shippingCharges: product.shippingCharges || '',
      productCode: product.productCode || '',
      productSaleType: product.productSaleType || 0,
      quantity: product.quantity || 0,
      attributes: attributesString,
      seller: product.seller?._id || '',
      mainImage: null,
      images: []
    })
    setEditDialogOpen(true)
  }

  const handleEditClose = () => {
    setEditDialogOpen(false)
    setEditProduct(null)
  }

  const handleEditSubmit = async () => {
    if (!editProduct) return
    
    setEditLoading(true)
    try {
      const formData = new FormData()
      
      // Required fields - only send what can be edited
      formData.append('productName', editFormData.productName)
      formData.append('description', editFormData.description)
      formData.append('price', editFormData.price)
      formData.append('shippingCharges', editFormData.shippingCharges)
      formData.append('productCode', editFormData.productCode)
      formData.append('productSaleType', editFormData.productSaleType)
      formData.append('quantity', editFormData.quantity)
      
      // Send attributes as JSON string
      if (editFormData.attributes) {
        formData.append('attributes', editFormData.attributes)
      }
      
      // Optional: only send if new image is selected
      if (editFormData.mainImage) {
        formData.append('mainImage', editFormData.mainImage)
      }
      
      // Only send if new images are selected
      if (editFormData.images && editFormData.images.length > 0) {
        editFormData.images.forEach((image) => {
          formData.append('images', image)
        })
      }
      
      console.log('Updating product:', editProduct._id)
      
      const res = await updateProduct(formData, editProduct._id)
      console.log('Update response:', res)
      
      if (res && res.status === true) {
        await fetchData()
        handleEditClose()
        toast.success('Product updated successfully!')
      } else {
        const errorMsg = res?.message || 'Failed to update product'
        toast.error(errorMsg)
        console.error('Update failed:', errorMsg)
      }
    } catch (error) {
      console.error('Edit error:', error)
      toast.error('An error occurred while updating the product')
    } finally {
      setEditLoading(false)
    }
  }

  const handleInfo = (productId) => {
    router.push(`/en/apps/ecommerce/products/detail/${productId}`)
  }

  const handleDeleteClick = (productId) => {
    setDeleteProductId(productId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteProductId) return
    
    setDeleteLoading(true)
    try {
      console.log('Deleting product:', deleteProductId)
      const res = await deleteProduct(deleteProductId)
      console.log('Delete response:', res)
      
      if (res && res.status === true) {
        // Show success message
        toast.success('Product deleted successfully!')
        
        // Close dialog
        setDeleteDialogOpen(false)
        setDeleteProductId(null)
        
        // Force refresh by fetching new data
        const start = pagination.pageIndex + 1
        const freshData = await getRealProducts(start, pagination.pageSize)
        console.log('Fresh data after delete:', freshData)
        
        if (freshData && freshData.status === true) {
          setData(freshData.product || freshData.products || freshData.data || [])
          setTotalPages(freshData.totalPages || 0)
          setTotalProducts(freshData.totalProducts || 0)
          // Force re-render
          setRefreshKey(prev => prev + 1)
        }
      } else {
        const errorMsg = res?.message || 'Failed to delete product'
        toast.error(errorMsg)
        console.error('Delete failed:', errorMsg)
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('An error occurred while deleting the product')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setDeleteProductId(null)
  }

  const handleToggleNewCollection = async (productId) => {
    const res = await toggleNewCollection(productId)
    if (res && res.status === true) {
      fetchData()
    }
  }

  const handleToggleOutOfStock = async (productId) => {
    const res = await toggleOutOfStock(productId)
    if (res && res.status === true) {
      fetchData()
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('no', {
        header: 'NO',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
        size: 50
      }),
      columnHelper.accessor('productName', {
        header: 'PRODUCT',
        enableGlobalFilter: true,
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-3'>
              <CustomAvatar
                src={row.original.mainImage}
                alt={row.original.productName || 'Product'}
                variant='rounded'
                skin='light'
                color='primary'
                size={34}
              >
                {getInitials(row.original.productName || 'Product')}
              </CustomAvatar>
              <Typography 
                className='font-medium'
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word',
                  minWidth: '200px',
                  maxWidth: '300px'
                }}
              >
                {row.original.productName || '-'}
              </Typography>
            </div>
          )
        },
        size: 250
      }),
      columnHelper.accessor('category', {
        header: 'CATEGORY',
        cell: ({ row }) => <Typography>{row.original.category?.name || '-'}</Typography>,
        size: 120
      }),
      columnHelper.accessor('subCategory', {
        header: 'SUBCATEGORY',
        cell: ({ row }) => <Typography>{row.original.subCategory?.name || '-'}</Typography>,
        size: 120
      }),
      columnHelper.accessor('productCode', {
        header: 'PRODUCT CODE',
        enableGlobalFilter: true,
        cell: ({ row }) => <Typography>{row.original.productCode || '-'}</Typography>,
        size: 120
      }),
      columnHelper.accessor('productSaleType', {
        header: 'PRODUCT SALE TYPE',
        cell: ({ row }) => {
          const saleType = row.original.productSaleType
          const typeMap = {
            0: 'Buy Now',
            1: 'Auction',
            2: 'Both'
          }
          return <Typography>{typeMap[saleType] || 'Buy Now'}</Typography>
        },
        size: 130
      }),
      columnHelper.accessor('price', {
        header: `PRICE (${currency})`,
        cell: ({ row }) => <Typography>{currency} {row.original.price || 0}</Typography>,
        size: 100
      }),
      columnHelper.accessor('shippingCharges', {
        header: `SHIPPING CHARGES (${currency})`,
        cell: ({ row }) => <Typography>{currency} {row.original.shippingCharges || 0}</Typography>,
        size: 150
      }),
      columnHelper.accessor('createStatus', {
        header: 'STATUS',
        cell: ({ row }) => {
          const status = row.original.createStatus || 'Pending'
          const colorMap = {
            Pending: 'warning',
            Approved: 'success',
            Rejected: 'error'
          }
          return <Chip label={status} color={colorMap[status] || 'default'} size='small' variant='tonal' />
        },
        size: 100
      }),
      columnHelper.accessor('isNewCollection', {
        header: 'NEW COLLECTION',
        cell: ({ row }) => (
          <Switch
            checked={row.original.isNewCollection || false}
            onChange={() => handleToggleNewCollection(row.original._id || row.original.productId)}
            size='small'
          />
        ),
        size: 120
      }),
      columnHelper.accessor('isOutOfStock', {
        header: 'OUT OF STOCK',
        cell: ({ row }) => (
          <Switch
            checked={row.original.isOutOfStock || false}
            onChange={() => handleToggleOutOfStock(row.original._id || row.original.productId)}
            size='small'
          />
        ),
        size: 120
      }),
      columnHelper.accessor('actions', {
        header: 'ACTIONS',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Tooltip title='Edit'>
              <IconButton size='small' onClick={() => handleEdit(row.original)}>
                <i className='tabler-edit text-textSecondary' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Info'>
              <IconButton size='small' onClick={() => handleInfo(row.original._id)}>
                <i className='tabler-info-circle text-textSecondary' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Delete'>
              <IconButton size='small' onClick={() => handleDeleteClick(row.original._id)}>
                <i className='tabler-trash text-error' />
              </IconButton>
            </Tooltip>
          </div>
        ),
        size: 120
      })
    ],
    [data]
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
    manualFiltering: false,
    pageCount: totalPages,
    rowCount: totalProducts
  })

  return (
    <Card>
      <CardHeader title='Products' />
      <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
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
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getCanSort(),
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
          {table.getRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  {isLoading ? 'Loading...' : 'No data available'}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={totalProducts}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
      />

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth='md' fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Seller'
                value={editProduct?.seller?.firstName + ' ' + editProduct?.seller?.lastName || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Product Name'
                value={editFormData.productName}
                onChange={(e) => setEditFormData({ ...editFormData, productName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Category'
                value={editProduct?.category?.name || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Sub Category'
                value={editProduct?.subCategory?.name || ''}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={`Price (${currency})`}
                type='number'
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={`Shipping Charge (${currency})`}
                type='number'
                value={editFormData.shippingCharges}
                onChange={(e) => setEditFormData({ ...editFormData, shippingCharges: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label='Product Code (6 digit)'
                value={editFormData.productCode}
                onChange={(e) => setEditFormData({ ...editFormData, productCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label='Product Sale Type'
                value={editFormData.productSaleType}
                onChange={(e) => setEditFormData({ ...editFormData, productSaleType: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value={0}>Buy Now</option>
                <option value={1}>Auction</option>
                <option value={2}>Both</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Quantity'
                type='number'
                value={editFormData.quantity}
                onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant='outlined'
                component='label'
                fullWidth
              >
                Choose Main Image
                <input
                  type='file'
                  hidden
                  accept='image/*'
                  onChange={(e) => setEditFormData({ ...editFormData, mainImage: e.target.files[0] })}
                />
              </Button>
              {editFormData.mainImage && (
                <Typography variant='caption' sx={{ mt: 1, display: 'block' }}>
                  Selected: {editFormData.mainImage.name}
                </Typography>
              )}
              {editProduct?.mainImage && !editFormData.mainImage && (
                <div style={{ marginTop: '8px' }}>
                  <img src={editProduct.mainImage} alt='Current' style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                </div>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description'
                multiline
                rows={4}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant='outlined'
                component='label'
                fullWidth
              >
                Select Multiple Images
                <input
                  type='file'
                  hidden
                  multiple
                  accept='image/*'
                  onChange={(e) => setEditFormData({ ...editFormData, images: Array.from(e.target.files) })}
                />
              </Button>
              {editFormData.images.length > 0 && (
                <Typography variant='caption' sx={{ mt: 1, display: 'block' }}>
                  {editFormData.images.length} image(s) selected
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color='secondary' disabled={editLoading}>
            Close
          </Button>
          <Button onClick={handleEditSubmit} variant='contained' color='primary' disabled={editLoading}>
            {editLoading ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth='xs' fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color='secondary' disabled={deleteLoading}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant='contained' color='error' disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default RealProductsTable
