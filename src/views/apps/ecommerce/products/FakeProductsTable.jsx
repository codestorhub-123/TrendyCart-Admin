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
import { getFakeProducts, createFakeProductByAdmin, toggleNewCollection, toggleOutOfStock, updateProduct, deleteProduct } from '@/services/productService'
import { getRealSeller } from '@/services/sellerService'
import { getAllCategories } from '@/services/categoryService'
import { listAllSubCategories } from '@/services/subCategoryService'
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

const FakeProductsTable = () => {
  const router = useRouter()
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const { currency } = useSelector(state => state.settingsReducer)
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [totalPages, setTotalPages] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [sellers, setSellers] = useState([])
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  
  // Add dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addFormData, setAddFormData] = useState({
    productName: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    shippingCharges: '',
    productCode: '',
    productSaleType: 0,
    quantity: 0,
    attributes: '[]',
    seller: '',
    mainImage: null,
    images: []
  })
  
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
    console.log('Fetching fake products with start:', start, 'limit:', pagination.pageSize)
    const res = await getFakeProducts(start, pagination.pageSize)
    console.log('Fake Products API Response:', res)
    if (res && res.status === true) {
      setData(res.product || res.products || res.data || [])
      setTotalPages(res.totalPages || 0)
      setTotalProducts(res.totalProducts || 0)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
    fetchSellers()
    fetchCategories()
  }, [pagination.pageIndex, pagination.pageSize, refreshKey])

  useEffect(() => {
    if (addFormData.category) {
      fetchSubCategories(addFormData.category)
    } else {
      setSubCategories([])
    }
  }, [addFormData.category])

  const fetchSellers = async () => {
    // Fetch all sellers (using a large limit)
    const res = await getRealSeller(1, 100)
    if (res && res.status === true) {
      setSellers(res.sellers || [])
    }
  }

  const fetchCategories = async () => {
    const res = await getAllCategories()
    if (res && res.status === true) {
      setCategories(res.category || res.categories || res.data || [])
    }
  }

  const fetchSubCategories = async (categoryId) => {
    const res = await listAllSubCategories(categoryId)
    console.log('Sub Categories Response:', res)
    if (res && res.status === true) {
      setSubCategories(res.subCategory || res.subCategories || res.data || [])
    }
  }

  const handleAddOpen = () => {
    setAddFormData({
      productName: '',
      description: '',
      price: '',
      category: '',
      subCategory: '',
      shippingCharges: '',
      productCode: '',
      productSaleType: 0,
      quantity: 0,
      attributes: '[]',
      seller: '',
      mainImage: null,
      images: []
    })
    setAddDialogOpen(true)
  }

  const handleAddClose = () => {
    setAddDialogOpen(false)
  }

  const handleAddSubmit = async () => {
    setAddLoading(true)
    try {
      const formData = new FormData()
      
      // Required fields
      formData.append('productName', addFormData.productName)
      formData.append('description', addFormData.description)
      formData.append('price', addFormData.price)
      formData.append('category', addFormData.category)
      formData.append('subCategory', addFormData.subCategory)
      formData.append('shippingCharges', addFormData.shippingCharges)
      formData.append('productCode', addFormData.productCode)
      formData.append('productSaleType', addFormData.productSaleType)
      formData.append('quantity', addFormData.quantity)
      formData.append('attributes', addFormData.attributes)
      
      // Seller ID is required for fake products
      if (addFormData.seller) {
        formData.append('sellerId', addFormData.seller)
      }
      
      if (addFormData.mainImage) formData.append('mainImage', addFormData.mainImage)
      
      if (addFormData.images && addFormData.images.length > 0) {
        addFormData.images.forEach((image) => {
          formData.append('images', image)
        })
      }
      
      console.log('Creating fake product')
      const res = await createFakeProductByAdmin(formData)
      console.log('Create response:', res)
      
      if (res && res.status === true) {
        toast.success(res.message || 'Fake product created successfully')
        setAddDialogOpen(false)
        setRefreshKey(prev => prev + 1)
      } else {
        toast.error(res.message || 'Failed to create fake product')
      }
    } catch (error) {
      console.error('Error creating fake product:', error)
      toast.error('An error occurred while creating the product')
    } finally {
      setAddLoading(false)
    }
  }

  const handleEdit = (product) => {
    setEditProduct(product)
    
    // Convert attributes format
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
      
      formData.append('productName', editFormData.productName)
      formData.append('description', editFormData.description)
      formData.append('price', editFormData.price)
      formData.append('shippingCharges', editFormData.shippingCharges)
      formData.append('productCode', editFormData.productCode)
      formData.append('productSaleType', editFormData.productSaleType)
      formData.append('quantity', editFormData.quantity)
      
      
      if (editFormData.mainImage) {
        formData.append('mainImage', editFormData.mainImage)
      }
      
      if (editFormData.images && editFormData.images.length > 0) {
        editFormData.images.forEach((image) => {
          formData.append('images', image)
        })
      }
      
      const res = await updateProduct(formData, editProduct._id)
      
      if (res && res.status === true) {
        toast.success('Product updated successfully!')
        handleEditClose()
        setRefreshKey(prev => prev + 1)
      } else {
        const errorMsg = res?.message || 'Failed to update product'
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('Edit error:', error)
      toast.error('An error occurred while updating the product')
    } finally {
      setEditLoading(false)
    }
  }

  const handleInfo = (productId) => {
     // Navigate to product detail page
     router.push(`/en/apps/ecommerce/products/detail/${productId}`)
  }

  const handleDeleteOpen = (id) => {
    setDeleteProductId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setDeleteProductId(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteProductId) return

    setDeleteLoading(true)
    try {
      // Optimistically update UI
      setData(prevData => prevData.filter(item => item._id !== deleteProductId && item.productId !== deleteProductId))
      
      const res = await deleteProduct(deleteProductId)
      
      if (res && res.status === true) {
        toast.success(res.message || 'Product deleted successfully')
        // Force refresh from server
        const start = pagination.pageIndex + 1
        const freshData = await getFakeProducts(start, pagination.pageSize)
        if (freshData && freshData.status === true) {
          setData(freshData.product || freshData.products || freshData.data || [])
          setTotalPages(freshData.totalPages || 0)
          setTotalProducts(freshData.totalProducts || 0)
          setRefreshKey(prev => prev + 1)
        }
      } else {
        toast.error(res.message || 'Failed to delete product')
        // Revert optimistic update if failed (simplified: just refresh)
        setRefreshKey(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('An error occurred while deleting the product')
    } finally {
      setDeleteLoading(false)
      setDeleteProductId(null)
    }
  }

  const handleToggleNewCollection = async (productId, currentValue) => {
    const res = await toggleNewCollection(productId)
    if (res && res.status === true) {
      setRefreshKey(prev => prev + 1)
    }
  }

  const handleToggleOutOfStock = async (productId, currentValue) => {
    const res = await toggleOutOfStock(productId)
    if (res && res.status === true) {
      setRefreshKey(prev => prev + 1)
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('_id', {
        header: 'NO',
        cell: ({ row }) => <Typography>{row.index + 1 + pagination.pageIndex * pagination.pageSize}</Typography>
      }),
      columnHelper.accessor('mainImage', {
        header: 'PRODUCT',
        cell: ({ row }) => {
          let imageUrl = row.original.mainImage
          if (imageUrl && imageUrl.includes('localhost')) {
             imageUrl = imageUrl.replace(/\\/g, '/')
          }
          return (
            <div className='flex items-center gap-3'>
              <Avatar src={imageUrl} alt={row.original.productName} variant='rounded' sx={{ width: 40, height: 40 }} />
              <div style={{ maxWidth: '200px' }}>
                <Typography className='line-clamp-2'>{row.original.productName}</Typography>
              </div>
            </div>
          )
        },
        enableGlobalFilter: true
      }),
      columnHelper.accessor('category.name', {
        header: 'CATEGORY',
        cell: ({ row }) => <Typography>{row.original.category?.name || '-'}</Typography>
      }),
      columnHelper.accessor('subCategory.name', {
        header: 'SUBCATEGORY',
        cell: ({ row }) => <Typography>{row.original.subCategory?.name || '-'}</Typography>
      }),
      columnHelper.accessor('productCode', {
        header: 'PRODUCT CODE',
        cell: ({ row }) => <Typography>{row.original.productCode}</Typography>,
        enableGlobalFilter: true
      }),
      columnHelper.accessor('price', {
        header: `PRICE (${currency})`,
        cell: ({ row }) => <Typography>{currency}{row.original.price}</Typography>
      }),
      columnHelper.accessor('shippingCharges', {
        header: `SHIPPING CHARGES (${currency})`,
        cell: ({ row }) => <Typography>{currency}{row.original.shippingCharges}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'STATUS',
        cell: ({ row }) => (
          <Chip
            label={row.original.createStatus === 1 ? 'Approved' : row.original.createStatus === 2 ? 'Rejected' : 'Pending'}
            color={row.original.createStatus === 1 ? 'success' : row.original.createStatus === 2 ? 'error' : 'warning'}
            size='small'
          />
        )
      }),
      columnHelper.accessor('isNewCollection', {
        header: 'NEW COLLECTION',
        cell: ({ row }) => (
          <Switch
            checked={row.original.isNewCollection || false}
            onChange={() => handleToggleNewCollection(row.original._id, row.original.isNewCollection)}
          />
        )
      }),
      columnHelper.accessor('isOutOfStock', {
        header: 'OUT OF STOCK',
        cell: ({ row }) => (
          <Switch
            checked={row.original.isOutOfStock || false}
            onChange={() => handleToggleOutOfStock(row.original._id, row.original.isOutOfStock)}
          />
        )
      }),
      columnHelper.accessor('actions', {
        header: 'EDIT',
        cell: ({ row }) => (
          <IconButton onClick={() => handleEdit(row.original)}>
            <i className='tabler-edit text-textSecondary' />
          </IconButton>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('info', {
        header: 'INFO',
        cell: ({ row }) => (
          <IconButton onClick={() => handleInfo(row.original._id)}>
            <i className='tabler-info-circle text-textSecondary' />
          </IconButton>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('delete', {
        header: 'DELETE',
        cell: ({ row }) => (
          <IconButton onClick={() => handleDeleteClick(row.original._id)}>
            <i className='tabler-trash text-error' />
          </IconButton>
        ),
        enableSorting: false
      })
    ],
    [pagination.pageIndex, pagination.pageSize]
  )

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    manualFiltering: true,
    state: {
      pagination,
      globalFilter
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
    rowCount: totalProducts
  })

  return (
    <Card>
      <CardHeader
        title='Fake Products'
        action={
          <div className='flex items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Searching for...'
              className='max-sm:is-full'
            />
            <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={handleAddOpen}>
              Add
            </Button>
          </div>
        }
      />
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
                  {isLoading ? 'Loading...' : 'No data available'}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
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

      {/* Add Product Dialog */}
      <Dialog open={addDialogOpen} onClose={handleAddClose} maxWidth='md' fullWidth>
        <DialogTitle>Add Fake Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label='Seller'
                value={addFormData.seller}
                onChange={(e) => setAddFormData({ ...addFormData, seller: e.target.value })}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
              >
                <option value='' disabled>-- Select Seller --</option>
                {sellers.map((seller, index) => (
                  <option key={seller._id || index} value={seller._id}>
                    {seller.firstName} {seller.lastName}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Product Name'
                value={addFormData.productName}
                onChange={(e) => setAddFormData({ ...addFormData, productName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Product Code (6 digit)'
                value={addFormData.productCode}
                onChange={(e) => setAddFormData({ ...addFormData, productCode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label='Category'
                value={addFormData.category}
                onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value, subCategory: '' })}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
              >
                <option value='' disabled>-- Select Category --</option>
                {categories.map((category) => {
                  const id = category._id || category.id
                  if (!id) return null
                  return <option key={id} value={id}>{category.name}</option>
                })}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label='Sub Category'
                value={addFormData.subCategory}
                onChange={(e) => setAddFormData({ ...addFormData, subCategory: e.target.value })}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
                disabled={!addFormData.category}
              >
                <option value='' disabled>-- Select Sub Category --</option>
                {subCategories.map((sub) => {
                  const id = sub._id || sub.id || sub.subCategoryId
                  if (!id) return null
                  return <option key={id} value={id}>{sub.name}</option>
                })}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={`Price (${currency})`}
                type='number'
                value={addFormData.price}
                onChange={(e) => setAddFormData({ ...addFormData, price: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={`Shipping Charge (${currency})`}
                type='number'
                value={addFormData.shippingCharges}
                onChange={(e) => setAddFormData({ ...addFormData, shippingCharges: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label='Quantity'
                type='number'
                value={addFormData.quantity}
                onChange={(e) => setAddFormData({ ...addFormData, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label='Product Sale Type'
                value={addFormData.productSaleType}
                onChange={(e) => setAddFormData({ ...addFormData, productSaleType: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value={0}>Buy Now</option>
                <option value={1}>Auction</option>
                <option value={2}>Both</option>
              </TextField>
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
                  onChange={(e) => setAddFormData({ ...addFormData, mainImage: e.target.files[0] })}
                />
              </Button>
              {addFormData.mainImage && (
                <Typography variant='caption' sx={{ mt: 1, display: 'block' }}>
                  Selected: {addFormData.mainImage.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description'
                multiline
                rows={4}
                value={addFormData.description}
                onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
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
                  onChange={(e) => setAddFormData({ ...addFormData, images: Array.from(e.target.files) })}
                />
              </Button>
              {addFormData.images.length > 0 && (
                <Typography variant='caption' sx={{ mt: 1, display: 'block' }}>
                  {addFormData.images.length} image(s) selected
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose} color='secondary' disabled={addLoading}>
            Cancel
          </Button>
          <Button onClick={handleAddSubmit} variant='contained' color='primary' disabled={addLoading}>
            {addLoading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog - Same as Real Products */}
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
              <Button variant='outlined' component='label' fullWidth>
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
              <Button variant='outlined' component='label' fullWidth>
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
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
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

export default FakeProductsTable
