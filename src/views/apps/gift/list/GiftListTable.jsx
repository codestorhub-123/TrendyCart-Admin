'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CustomAvatar from '@core/components/mui/Avatar'

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
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import GiftDialog from '@/components/dialogs/gift'

// Service Imports
import { getAllGift, getGiftCategories } from '@/services/userService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Styled Components
const Icon = styled('i')({})

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Column Definitions
const columnHelper = createColumnHelper()

const GiftListTable = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [giftDialogOpen, setGiftDialogOpen] = useState(false)
  const [editGift, setEditGift] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [giftToDelete, setGiftToDelete] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  // API Base URL - use same as reference code
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081'

  // Load gifts and categories function
  const loadGifts = async () => {
    setLoading(true)
    try {
      const [giftsResult, categoriesResult] = await Promise.all([getAllGift(), getGiftCategories()])

      // Normalize image paths - convert backslashes to forward slashes
      const normalizedGifts = Array.isArray(giftsResult)
        ? giftsResult.map(gift => ({
            ...gift,
            image: gift.image ? gift.image.replace(/\\/g, '/') : gift.image
          }))
        : giftsResult

      // Sort by createdAt descending (newest first)
      const sortedGifts = Array.isArray(normalizedGifts)
        ? [...normalizedGifts].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAt || 0).getTime()
            return dateB - dateA // Descending order (newest first)
          })
        : normalizedGifts

      setData(sortedGifts)
      setFilteredData(sortedGifts)
      setCategories(categoriesResult || [])
    } catch (error) {
      console.error('Error loading gifts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadGifts()
  }, [])

  // Category map for display
  const categoryMap = useMemo(() => {
    const map = {}
    categories.forEach(cat => {
      map[cat._id] = cat.name
    })
    return map
  }, [categories])

  // Update filteredData when data changes
  useEffect(() => {
    setFilteredData(data)
  }, [data])

  // Handle gift updated
  const handleGiftSuccess = () => {
    loadGifts()
    setGiftDialogOpen(false)
    setEditGift(null)
  }

  // Handle create gift
  const handleCreateGift = () => {
    setEditGift(null)
    setGiftDialogOpen(true)
  }

  // Handle edit gift
  const handleEditGift = gift => {
    setEditGift(gift)
    setGiftDialogOpen(true)
  }

  // Get gift image - normalize backslashes to forward slashes
  const getGiftImage = image => {
    if (!image) return null
    if (image.startsWith('http')) return image

    // Normalize image path - convert backslashes to forward slashes
    const normalizedImage = image.replace(/\\/g, '/')

    // Get base URL - use API_BASE directly like reference code
    const baseUrl = API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081'

    // Construct URL exactly like reference: baseUrl/uploads/filename.gif
    const fullUrl = `${baseUrl}/${normalizedImage}`

    return fullUrl
  }

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('image', {
        header: 'Image',
        cell: ({ row }) => {
          const image = row.original.image
          const imageUrl = getGiftImage(image)

          // Render exactly like reference code
          return (
            <div className='flex justify-center'>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={row.original.name || 'Gift'}
                  className='w-12 h-12 object-cover rounded'
                  onError={e => {
                    e.target.onerror = null
                    e.target.style.display = 'none'
                    const parent = e.target.parentElement
                    if (parent) {
                      parent.innerHTML = `<div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-white">${(row.original.name || 'G').charAt(0).toUpperCase()}</div>`
                    }
                  }}
                />
              ) : (
                <div className='w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-white'>
                  {(row.original.name || 'G').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )
        }
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.name || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('categoryId', {
        header: 'Category',
        cell: ({ row }) => <Typography>{categoryMap[row.original.categoryId] || '-'}</Typography>
      }),
      columnHelper.accessor('coins', {
        header: 'Coins',
        cell: ({ row }) => <Typography>{row.original.coins || 0}</Typography>
      }),
      //   columnHelper.accessor('isActive', {
      //     header: 'Active',
      //     cell: ({ row }) => {
      //       const isActive = row.original.isActive !== false
      //       return (
      //         <Chip
      //           variant='tonal'
      //           label={isActive ? 'Active' : 'Inactive'}
      //           size='small'
      //           color={isActive ? 'success' : 'secondary'}
      //         />
      //       )
      //     }
      //   }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton onClick={() => handleEditGift(row.original)} title='Edit Gift'>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, categoryMap]
  )

  // Apply category filter to data before passing to table
  const categoryFilteredData = useMemo(() => {
    if (!selectedCategory) return filteredData
    return filteredData.filter(gift => gift.categoryId === selectedCategory)
  }, [filteredData, selectedCategory])

  const table = useReactTable({
    data: categoryFilteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
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

  return (
    <>
      <Card>
        {/* Header Section */}
        <div className='p-6 border-bs'>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div>
              <Typography variant='h4' className='mbe-1 font-bold' style={{ color: '#424242' }}>
                Gifts
              </Typography>
            </div>
            <div className='flex items-center gap-2'>
              <Typography variant='body2' className='text-textSecondary'>
                Total Gifts:
              </Typography>
              <Typography variant='h6'>{filteredData.length}</Typography>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex items-center gap-4'>
            <Button variant='contained' onClick={handleCreateGift} startIcon={<i className='tabler-plus' />}>
              Create Gift
            </Button>
          </div>
          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <CustomTextField
              select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className='max-sm:is-full sm:is-[180px]'
              placeholder='Filter by Category'
            >
              <MenuItem value=''>All Categories</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </CustomTextField>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className='max-sm:is-full sm:is-[70px]'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='25'>25</MenuItem>
              <MenuItem value='50'>50</MenuItem>
            </CustomTextField>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Gifts'
              className='max-sm:is-full'
            />
          </div>
        </div>
        <div className='overflow-x-auto'>
          {loading ? (
            <div className='flex justify-center items-center p-6'>
              <CircularProgress />
            </div>
          ) : (
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
                    <td colSpan={columns.length} className='text-center'>
                      No data available
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  {table
                    .getRowModel()
                    .rows.slice(0, table.getState().pagination.pageSize)
                    .map(row => {
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
          )}
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
        />
      </Card>
      <GiftDialog open={giftDialogOpen} setOpen={setGiftDialogOpen} onSuccess={handleGiftSuccess} editData={editGift} />
    </>
  )
}

export default GiftListTable
