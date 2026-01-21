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
import DialogContentText from '@mui/material/DialogContentText'

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
import CoinPlanDialog from '@/components/dialogs/coin-plan'

// Service Imports
import { getAllCoinPlans, createCoinPlan, updateCoinPlan, deleteCoinPlan } from '@/services/userService'

// Toast Imports
import { toast } from 'react-toastify'

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

const CoinPlanListTable = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [coinPlanDialogOpen, setCoinPlanDialogOpen] = useState(false)
  const [editCoinPlan, setEditCoinPlan] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [coinPlanToDelete, setCoinPlanToDelete] = useState(null)

  // Load coin plans function
  const loadCoinPlans = async () => {
    setLoading(true)
    try {
      const result = await getAllCoinPlans()
      // Sort by createdAt descending (newest first)
      const sortedCoinPlans = Array.isArray(result)
        ? [...result].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAt || 0).getTime()
            return dateB - dateA // Descending order (newest first)
          })
        : result
      setData(sortedCoinPlans)
      setFilteredData(sortedCoinPlans)
    } catch (error) {
      console.error('Error loading coin plans:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadCoinPlans()
  }, [])

  // Update filteredData when data changes
  useEffect(() => {
    setFilteredData(data)
  }, [data])

  // Handle coin plan updated
  const handleCoinPlanSuccess = () => {
    loadCoinPlans()
    setCoinPlanDialogOpen(false)
    setEditCoinPlan(null)
  }

  // Handle create coin plan
  const handleCreateCoinPlan = () => {
    setEditCoinPlan(null)
    setCoinPlanDialogOpen(true)
  }

  // Handle edit coin plan
  const handleEditCoinPlan = coinPlan => {
    setEditCoinPlan(coinPlan)
    setCoinPlanDialogOpen(true)
  }

  // Handle delete coin plan
  const handleDeleteCoinPlan = coinPlan => {
    setCoinPlanToDelete(coinPlan)
    setDeleteDialogOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!coinPlanToDelete) return

    try {
      await deleteCoinPlan(coinPlanToDelete._id)
      toast.success('Coin plan deleted successfully')
      setDeleteDialogOpen(false)
      setCoinPlanToDelete(null)
      loadCoinPlans()
    } catch (error) {
      console.error('Error deleting coin plan:', error)
      toast.error(error.message || 'Failed to delete coin plan')
    }
  }

  // Columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('selection', {
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            aria-label='select all'
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label='select row'
          />
        ),
        enableSorting: false,
        enableHiding: false
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.name || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('coins', {
        header: 'Coins',
        cell: ({ row }) => <Typography>{row.original.coins || 0}</Typography>
      }),
      columnHelper.accessor('productId', {
        header: 'Product ID',
        cell: ({ row }) => <Typography>{row.original.productId || '-'}</Typography>
      }),
      columnHelper.accessor('rupees', {
        header: 'Rupees',
        cell: ({ row }) => <Typography>{row.original.rupees || 0}</Typography>
      }),
      columnHelper.accessor('dollars', {
        header: 'Dollars',
        cell: ({ row }) => <Typography>{row.original.dollars || 0}</Typography>
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => (
          <Typography className='max-w-[200px] truncate' title={row.original.description}>
            {row.original.description || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('isActive', {
        header: 'Active',
        cell: ({ row }) => {
          const isActive = row.original.isActive !== false
          return (
            <Chip
              variant='tonal'
              label={isActive ? 'Active' : 'Inactive'}
              size='small'
              color={isActive ? 'success' : 'secondary'}
            />
          )
        }
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton onClick={() => handleEditCoinPlan(row.original)} title='Edit Coin Plan'>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            <IconButton onClick={() => handleDeleteCoinPlan(row.original)} title='Delete Coin Plan' color='error'>
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
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
                Coin Plans
              </Typography>
            </div>
            <div className='flex items-center gap-2'>
              <Typography variant='body2' className='text-textSecondary'>
                Total Coin Plans:
              </Typography>
              <Typography variant='h6'>{filteredData.length}</Typography>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex items-center gap-4'>
            <Button variant='contained' onClick={handleCreateCoinPlan} startIcon={<i className='tabler-plus' />}>
              Create Coin Plan
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
              placeholder='Search Coin Plans'
              className='max-sm:is-full'
            />
          </div>
        </div>
        <div className='overflow-x-auto'>
          {loading ? (
            <div className='flex justify-center items-center py-20'>
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
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <Icon className='tabler-chevron-up text-xl' />,
                              desc: <Icon className='tabler-chevron-down text-xl' />
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className='text-center'>
                      No data available
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <TablePaginationComponent table={table} />
      </Card>

      {/* Create/Edit Dialog */}
      <CoinPlanDialog
        open={coinPlanDialogOpen}
        setOpen={setCoinPlanDialogOpen}
        onSuccess={handleCoinPlanSuccess}
        editData={editCoinPlan}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Coin Plan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{coinPlanToDelete?.name}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CoinPlanListTable
