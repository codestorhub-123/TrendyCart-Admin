'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Checkbox from '@mui/material/Checkbox'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import CustomTextField from '@core/components/mui/TextField'

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
import LanguageDialog from '@components/dialogs/language'
import { getAllLanguages, deleteLanguage } from '@/services/userService'

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

const LanguageListTable = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(null)

  // Load languages function
  const loadLanguages = async () => {
    setLoading(true)
    try {
      const result = await getAllLanguages()
      console.log('Languages API Response:', result) // Debug log

      // Handle API response structure
      const languages = result?.data?.data || result?.data || result || []
      console.log('Extracted languages:', languages) // Debug log
      console.log('Languages count:', languages.length) // Debug log

      // Sort by createdAt descending (newest first)
      const sortedLanguages = Array.isArray(languages)
        ? [...languages].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAt || 0).getTime()
            return dateB - dateA // Descending order (newest first)
          })
        : []

      setData(sortedLanguages)
      setFilteredData(sortedLanguages)
    } catch (error) {
      console.error('Error loading languages:', error)
      toast.error('Failed to load languages')
      setData([])
      setFilteredData([])
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadLanguages()
  }, [])

  // Update filteredData when data changes
  useEffect(() => {
    setFilteredData(data)
  }, [data])

  // Handle create
  const handleCreate = () => {
    setEditData(null)
    setDialogOpen(true)
  }

  // Handle delete
  const handleDelete = language => {
    setSelectedLanguage(language)
    setDeleteDialogOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedLanguage) return

    try {
      const languageId = selectedLanguage.id || selectedLanguage._id
      await deleteLanguage(languageId)
      toast.success('Language deleted successfully')
      setDeleteDialogOpen(false)
      setSelectedLanguage(null)
      loadLanguages()
    } catch (error) {
      console.error('Error deleting language:', error)
      toast.error(error.message || 'Failed to delete language')
    }
  }

  // Format date
  const formatDate = date => {
    if (!date) return '-'
    return new Date(date).toLocaleString()
  }

  // Columns
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
      columnHelper.accessor('language', {
        header: 'Language',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.language || row.original.name || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: ({ row }) => <Typography variant='body2'>{formatDate(row.original.createdAt)}</Typography>
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => {
          return (
            <div className='flex items-center gap-2'>
              <IconButton size='small' onClick={() => handleDelete(row.original)} color='error'>
                <i className='tabler-trash text-textSecondary' />
              </IconButton>
            </div>
          )
        },
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    getRowId: row => row.id || row._id || Math.random().toString(),
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

  // Handle dialog success
  const handleDialogSuccess = () => {
    loadLanguages()
  }

  return (
    <>
      <Card>
        {/* Header Section */}
        <div className='p-6 border-bs'>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div>
              <Typography variant='h4' className='mbe-1 font-bold' style={{ color: '#424242' }}>
                Languages
              </Typography>
            </div>
            <div className='flex items-center gap-2'>
              <Typography variant='body2' className='text-textSecondary'>
                Total Languages:
              </Typography>
              <Typography variant='h6'>{filteredData.length}</Typography>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex items-center gap-4'>
            <Button variant='contained' onClick={handleCreate} startIcon={<i className='tabler-plus' />}>
              Create Language
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
              placeholder='Search Languages'
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

      {/* Create/Edit Dialog */}
      <LanguageDialog open={dialogOpen} setOpen={setDialogOpen} onSuccess={handleDialogSuccess} editData={editData} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Delete Language</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the language "{selectedLanguage?.language || selectedLanguage?.name}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant='contained' color='error' onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default LanguageListTable
