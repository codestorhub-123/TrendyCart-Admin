'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'

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
import { useSession } from 'next-auth/react'

// Component Imports
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import SendNotification from '@/components/dialogs/send-notification'
import CreateFakeHost from '@/components/dialogs/create-fake-host'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getImageUrl } from '@/utils/imageUrl'

// Service Imports
import { getHosts, getUserInfoAndNavigate } from '@/services/userService'

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

// Vars
const hostStatusObj = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary',
  blocked: 'error',
  online: 'success',
  offline: 'secondary'
}

// Column Definitions
const columnHelper = createColumnHelper()

const HostListTable = ({ tableData, isFake = false, setIsFake }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState(data)
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [selectedHostId, setSelectedHostId] = useState(null)
  const [createFakeHostOpen, setCreateFakeHostOpen] = useState(false)



  // Auth headers function
  const getAuthHeaders = () => {
    // Token is stored as 'authToken' from login response
    const token = localStorage.getItem('authToken') || localStorage.getItem('token')
    if (!token) return {}
    // Remove Bearer prefix if present, then add it back
    const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token
    return { Authorization: `Bearer ${cleanToken}` }
  }

  // Toggle block API function
  const toggleBlockAPI = async (hostId, isBlocked) => {
    try {
      const res = await fetch(`${API_BASE}/admin-agency/block-unblock/block/${hostId}`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isBlocked: !isBlocked })
      })
      return await res.json()
    } catch (error) {
      console.error('Error in toggleBlockAPI:', error)
      throw error
    }
  }

  // Toggle block status function
  const toggleBlockStatus = async hostId => {
    try {
      const host = data.find(h => h.id === hostId)
      if (!host) return
      await toggleBlockAPI(hostId, host.isBlocked)
      setData(data.map(h => (h.id === hostId ? { ...h, isBlocked: !h.isBlocked } : h)))
      setFilteredData(filteredData.map(h => (h.id === hostId ? { ...h, isBlocked: !h.isBlocked } : h)))
    } catch (error) {
      console.error('Error updating block status:', error)
      alert('Failed to update block status')
    }
  }

  // Load hosts function
  const loadHosts = async (from = 1, to = 20, search = '', fakeStatus = false) => {
    setLoading(true)
    try {
      const result = await getHosts(from, to, search, '', fakeStatus)
      const mappedHosts = (result.data?.hosts || result.data?.users || []).map(host => ({
        id: host._id,
        fullName: host.name,
        username: host.uniqueId,
        email: host.email,
        avatar: host.avatar,
        status: host.status,
        age: host.age,
        gender: host.gender,
        coins: host.coins,
        followers: host.followers || 0,
        following: host.following || 0,
        isOnline: fakeStatus ? false : host.isOnline || false,
        isBlocked: host.isBlocked,
        loginType: host.loginType || 'Email',
        country: host.country || 'N/A',
        isHost: host.isHost || false,
        createdAt: host.createdAt,
        vipStatus: host.vipStatus || false,
        agency: host.agency || 'N/A'
      }))
      setData(mappedHosts)
      setFilteredData(mappedHosts)
    } catch (error) {
      console.error('Error loading hosts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadHosts(1, 20, '', isFake)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFake])

  // Handle fake host created
  const handleFakeHostCreated = () => {
    loadHosts(1, 20, globalFilter, isFake)
  }

  // Hooks
  const { lang: locale } = useParams()
  const { data: session } = useSession()
  const router = useRouter()

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
      columnHelper.accessor('avatar', {
        header: 'Media',
        cell: ({ row }) => getAvatar({ avatar: row.original.avatar, fullName: row.original.fullName })
      }),
      columnHelper.accessor('fullName', {
        header: 'Name',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.fullName || '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ row }) => <Typography>{row.original.email || '-'}</Typography>
      }),
      columnHelper.accessor('loginType', {
        header: 'Login Type',
        cell: ({ row }) => <Typography>{row.original.loginType || '-'}</Typography>
      }),
      columnHelper.accessor('username', {
        header: 'Unique ID',
        cell: ({ row }) => <Typography>{row.original.username || '-'}</Typography>
      }),
      columnHelper.accessor('country', {
        header: 'Country',
        cell: ({ row }) => <Typography>{row.original.country || 'N/A'}</Typography>
      }),
      columnHelper.accessor('followers', {
        header: 'Followers',
        cell: ({ row }) => <Typography>{row.original.followers || 0}</Typography>
      }),
      columnHelper.accessor('following', {
        header: 'Following',
        cell: ({ row }) => <Typography>{row.original.following || 0}</Typography>
      }),
      columnHelper.accessor('isHost', {
        header: 'Host',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.isHost ? 'Yes' : 'No'}
            size='small'
            color={row.original.isHost ? 'success' : 'secondary'}
          />
        )
      }),
      columnHelper.accessor('agency', {
        header: 'Agency',
        cell: ({ row }) => <Typography>{row.original.agency || 'N/A'}</Typography>
      }),
      columnHelper.accessor('isOnline', {
        header: 'Online',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.isOnline ? 'Online' : 'Offline'}
            size='small'
            color={row.original.isOnline ? 'success' : 'secondary'}
          />
        )
      }),
      columnHelper.accessor('vipStatus', {
        header: 'VIP',
        cell: ({ row }) => (
          <Chip
            variant='tonal'
            label={row.original.vipStatus ? 'Yes' : 'No'}
            size='small'
            color={row.original.vipStatus ? 'warning' : 'secondary'}
          />
        )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: ({ row }) => (
          <Typography>
            {row.original.createdAt
              ? new Date(row.original.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('isBlocked', {
        header: 'Block',
        cell: ({ row }) => {
          const [isToggling, setIsToggling] = useState(false)

          const handleToggleBlock = async () => {
            try {
              setIsToggling(true)
              await toggleBlockStatus(row.original.id)
            } catch (error) {
              console.error('Error toggling block status:', error)
            } finally {
              setIsToggling(false)
            }
          }

          return (
            <Switch
              checked={!row.original.isBlocked}
              onChange={handleToggleBlock}
              disabled={isToggling}
              size='small'
              color='success'
            />
          )
        }
      }),
      columnHelper.accessor('action', {
        header: 'Info',
        cell: ({ row }) => (
          <IconButton
            onClick={async () => {
              try {
                const fallbackUrl = locale
                  ? `/${locale}/apps/host/view?id=${row.original.id}`
                  : `/apps/host/view?id=${row.original.id}`
                router.push(fallbackUrl)
              } catch (error) {
                console.error('Error navigating to host view:', error)
              }
            }}
            title='View Host Info'
          >
            <i className='tabler-eye text-textSecondary' />
          </IconButton>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('edit', {
        header: 'Edit',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconButton
              onClick={() => {
                setSelectedHostId(row.original.id)
                setNotificationOpen(true)
              }}
              title='Send Notification'
            >
              <i className='tabler-bell text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, filteredData]
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

  const getAvatar = params => {
    const { avatar, fullName } = params
    if (avatar) {
      return <CustomAvatar src={getImageUrl(avatar)} size={34} />
    } else {
      return <CustomAvatar size={34}>{getInitials(fullName)}</CustomAvatar>
    }
  }

  return (
    <>
      <Card>
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2 bg-[var(--mui-palette-background-paper)] rounded-lg p-1 border border-[var(--mui-palette-divider)]'>
              <Button
                variant={!isFake ? 'contained' : 'text'}
                color={!isFake ? 'primary' : 'inherit'}
                onClick={() => {
                  setIsFake(false)
                  setGlobalFilter('')
                }}
                size='small'
                className={!isFake ? 'min-w-[120px]' : 'min-w-[120px]'}
              >
                Real Hosts
              </Button>
              <Button
                variant={isFake ? 'contained' : 'text'}
                color={isFake ? 'primary' : 'inherit'}
                onClick={() => {
                  setIsFake(true)
                  setGlobalFilter('')
                }}
                size='small'
                className={isFake ? 'min-w-[120px]' : 'min-w-[120px]'}
              >
                Fake Hosts
              </Button>
            </div>
            {isFake && (
              <Button
                variant='contained'
                color='primary'
                onClick={() => setCreateFakeHostOpen(true)}
                startIcon={<i className='tabler-plus' />}
              >
                Create Fake Host
              </Button>
            )}
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
              onChange={value => {
                setGlobalFilter(String(value))
                loadHosts(1, 20, String(value), isFake)
              }}
              placeholder='Search Host'
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
      <SendNotification open={notificationOpen} setOpen={setNotificationOpen} userId={selectedHostId} />
      <CreateFakeHost open={createFakeHostOpen} setOpen={setCreateFakeHostOpen} onSuccess={handleFakeHostCreated} />
    </>
  )
}

export default HostListTable
