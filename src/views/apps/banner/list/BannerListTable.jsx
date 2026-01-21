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
import BannerDialog from '@/components/dialogs/banner'

// Service Imports
import { getBanners, deleteBanner } from '@/services/userService'

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

const BannerListTable = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false)
  const [editBanner, setEditBanner] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState(null)

  // API Base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE

  // Load banners function
  const loadBanners = async () => {
    setLoading(true)
    try {
      const result = await getBanners()
      // Sort by createdAt descending (newest first)
      const sortedBanners = Array.isArray(result)
        ? [...result].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAt || 0).getTime()
            return dateB - dateA // Descending order (newest first)
          })
        : result
      setData(sortedBanners)
      setFilteredData(sortedBanners)
    } catch (error) {
      console.error('Error loading banners:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadBanners()
  }, [])

  // Handle banner created/updated
  const handleBannerSuccess = () => {
    loadBanners()
    setBannerDialogOpen(false)
    setEditBanner(null)
  }

  // Handle create banner
  const handleCreateBanner = () => {
    setEditBanner(null)
    setBannerDialogOpen(true)
  }

  // Handle edit banner
  const handleEditBanner = banner => {
    setEditBanner(banner)
    setBannerDialogOpen(true)
  }

  // Handle delete banner
  const handleDeleteBanner = async () => {
    if (!bannerToDelete) return

    try {
      await deleteBanner(bannerToDelete._id)
      loadBanners()
      setDeleteDialogOpen(false)
      setBannerToDelete(null)
    } catch (error) {
      console.error('Error deleting banner:', error)
      alert('Failed to delete banner')
    }
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
          const imageUrl = image ? (image.startsWith('http') ? image : `${API_BASE}/${image}`) : null

          return imageUrl ? (
            <img src={imageUrl} alt={row.original.title} className='w-20 h-20 object-cover rounded' />
          ) : (
            <Typography variant='body2' color='text.secondary'>
              No Image
            </Typography>
          )
        }
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: ({ row }) => <Typography className='font-medium'>{row.original.title}</Typography>
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => (
          <Typography variant='body2' className='max-w-xs truncate'>
            {row.original.description}
          </Typography>
        )
      }),
      columnHelper.accessor('link', {
        header: 'Link',
        cell: ({ row }) => (
          <Typography variant='body2' className='max-w-xs truncate'>
            {row.original.link || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('isForHost', {
        header: 'For Host',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.isForHost ? 'Yes' : 'No'}
            size='small'
            color={row.original.isForHost ? 'primary' : 'default'}
          />
        )
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.isActive ? 'Active' : 'Inactive'}
            size='small'
            color={row.original.isActive ? 'success' : 'secondary'}
          />
        )
      }),

      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton onClick={() => handleEditBanner(row.original)} title='Edit Banner'>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            <IconButton
              onClick={() => {
                setBannerToDelete(row.original)
                setDeleteDialogOpen(true)
              }}
              title='Delete Banner'
            >
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [API_BASE]
  )

  const table = useReactTable({
    data: filteredData,
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
                Banners
              </Typography>
            </div>
            <div className='flex items-center gap-2'>
              <Typography variant='body2' className='text-textSecondary'>
                Total Banners:
              </Typography>
              <Typography variant='h6'>{filteredData.length}</Typography>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex items-center gap-4'>
            <Button variant='contained' onClick={handleCreateBanner} startIcon={<i className='tabler-plus' />}>
              Create Banner
            </Button>
          </div>
          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
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
              placeholder='Search Banner'
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
      <BannerDialog
        open={bannerDialogOpen}
        setOpen={setBannerDialogOpen}
        onSuccess={handleBannerSuccess}
        editData={editBanner}
      />
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Banner</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this banner? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteBanner} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BannerListTable
