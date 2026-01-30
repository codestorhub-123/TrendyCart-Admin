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
import CustomTextField from '@core/components/mui/TextField'
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
import { getImageUrl } from '@/utils/imageUrl'
import { getAllComplains, resolveComplaint } from '@/services/userService'

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

const ComplaintListTable = () => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [resolveMessage, setResolveMessage] = useState('')





  // Load complaints function
  const loadComplaints = async () => {
    setLoading(true)
    try {
      const result = await getAllComplains()
      console.log('Complaints API Response:', result) // Debug log

      // Handle API response structure: { success: true, data: { complaints: [...] } }
      const complaints = result?.data?.complaints || result?.complaints || result?.data || result || []
      console.log('Extracted complaints:', complaints) // Debug log
      console.log('Complaints count:', complaints.length) // Debug log

      // Sort by createdAt descending (newest first)
      const sortedComplaints = Array.isArray(complaints)
        ? [...complaints].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime()
            const dateB = new Date(b.createdAt || 0).getTime()
            return dateB - dateA // Descending order (newest first)
          })
        : []

      setData(sortedComplaints)
      setFilteredData(sortedComplaints)
    } catch (error) {
      console.error('Error loading complaints:', error)
      toast.error('Failed to load complaints')
      setData([])
      setFilteredData([])
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadComplaints()
  }, [])

  // Update filteredData when data changes
  useEffect(() => {
    setFilteredData(data)
  }, [data])

  // Handle resolve complaint
  const handleResolve = complaint => {
    setSelectedComplaint(complaint)
    setResolveMessage('')
    setResolveDialogOpen(true)
  }

  // Confirm resolve
  const confirmResolve = async () => {
    if (!selectedComplaint) return

    try {
      // Use id or _id field
      const complaintId = selectedComplaint.id || selectedComplaint._id
      await resolveComplaint(complaintId, {
        status: 'closed',
        adminResponse: resolveMessage || 'Resolved'
      })
      toast.success('Complaint resolved successfully')
      setResolveDialogOpen(false)
      setSelectedComplaint(null)
      setResolveMessage('')
      loadComplaints()
    } catch (error) {
      console.error('Error resolving complaint:', error)
      toast.error(error.message || 'Failed to resolve complaint')
    }
  }

  // Get status label and color
  const getStatusInfo = status => {
    const statusLower = (status || '').toLowerCase()
    if (statusLower === 'resolved' || statusLower === 'completed' || statusLower === 'closed') {
      return { label: statusLower === 'closed' ? 'Closed' : 'Resolved', color: 'success' }
    }
    if (statusLower === 'pending' || statusLower === 'open') {
      return { label: statusLower === 'open' ? 'Open' : 'Pending', color: 'warning' }
    }
    return { label: status || 'Pending', color: 'secondary' }
  }

  // Format date
  const formatDate = date => {
    if (!date) return '-'
    return new Date(date).toLocaleString()
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
      columnHelper.accessor('image', {
        header: 'Image',
        cell: ({ row }) => {
          const complaint = row.original
          // API returns: image (complaint image) or user.avatar
          const imageUrl = getImageUrl(complaint.image || complaint.user?.avatar)

          if (imageUrl) {
            return <CustomAvatar src={imageUrl} size={40} alt={complaint.user?.name || 'User'} variant='rounded' />
          }
          return (
            <CustomAvatar size={40} variant='rounded'>
              <i className='tabler-user' />
            </CustomAvatar>
          )
        }
      }),
      columnHelper.accessor('user', {
        header: 'User',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.user?.name || row.original.userId?.name || row.original.userName || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('contact', {
        header: 'Contact',
        cell: ({ row }) => (
          <Typography>
            {row.original.contact ||
              row.original.user?.email ||
              row.original.userId?.email ||
              row.original.email ||
              '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('message', {
        header: 'Message',
        cell: ({ row }) => (
          <Typography className='max-w-[300px] truncate' title={row.original.message || row.original.complaint}>
            {row.original.message || row.original.complaint || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const statusInfo = getStatusInfo(row.original.status)
          return <Chip variant='tonal' label={statusInfo.label} size='small' color={statusInfo.color} />
        }
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: ({ row }) => <Typography variant='body2'>{formatDate(row.original.createdAt)}</Typography>
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => {
          const status = (row.original.status || '').toLowerCase()
          const isResolved = status === 'resolved' || status === 'completed' || status === 'closed'

          return (
            <div className='flex items-center gap-2'>
              {!isResolved && (
                <Button variant='contained' size='small' color='success' onClick={() => handleResolve(row.original)}>
                  Resolve
                </Button>
              )}
              {isResolved && (
                <Typography variant='body2' className='text-textSecondary'>
                  {status === 'closed' ? 'Closed' : 'Resolved'}
                </Typography>
              )}
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
    getRowId: row => row.id || row._id || Math.random().toString(), // Use id or _id as row ID
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
                Complaints
              </Typography>
            </div>
            <div className='flex items-center gap-2'>
              <Typography variant='body2' className='text-textSecondary'>
                Total Complaints:
              </Typography>
              <Typography variant='h6'>{filteredData.length}</Typography>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex items-center gap-4'>
            <Typography variant='h4'>Complaints</Typography>
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
              placeholder='Search Complaints'
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

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Resolve Complaint</DialogTitle>
        <DialogContent>
          <DialogContentText className='mb-4'>
            Resolve complaint from{' '}
            {selectedComplaint?.user?.name || selectedComplaint?.userId?.name || selectedComplaint?.userName || 'User'}
          </DialogContentText>
          <CustomTextField
            fullWidth
            multiline
            rows={4}
            placeholder='Enter resolution message (optional)'
            value={resolveMessage}
            onChange={e => setResolveMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
          <Button variant='contained' color='success' onClick={confirmResolve}>
            Resolve
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ComplaintListTable
