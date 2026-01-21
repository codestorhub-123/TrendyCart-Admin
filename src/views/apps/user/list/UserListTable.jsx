'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'

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
import TableFilters from './TableFilters'
import AddUserDrawer from './AddUserDrawer'
import OptionMenu from '@core/components/option-menu'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getInitials } from '@/utils/getInitials'

import { getAllUsers, blockUnblockUser } from '@/services/userService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  // States
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
const userRoleObj = {
  admin: { icon: 'tabler-crown', color: 'error' },
  author: { icon: 'tabler-device-desktop', color: 'warning' },
  editor: { icon: 'tabler-edit', color: 'info' },
  maintainer: { icon: 'tabler-chart-pie', color: 'success' },
  subscriber: { icon: 'tabler-user', color: 'primary' }
}

const userStatusObj = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// Column Definitions
const columnHelper = createColumnHelper()

const UserListTable = ({ tableData }) => {
  // States
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const getAllUsersData = async () => {
    try {
      setLoading(true)
      const { pageIndex, pageSize } = pagination
      const result = await getAllUsers(pageIndex, pageSize)
      
      if (result.success || result.status === 200 || result.status === true) {
        // Adjust based on actual API response structure
        const users = result.data || result.users || []
        // Try to find total count from response
        const totalCount = result.total || result.totalUsers || result.totalUser || result.count || users.length
        setData(users)
        setTotal(totalCount)
        // If we only have invalid local data, don't setFilteredData to it if we want server side
        setFilteredData(users) 
      }
    } catch (error) {
      console.error('Failed to fetch users', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockUnblock = async (userId) => {
    try {
      const res = await blockUnblockUser(userId)
      if (res.ok) {
        // Refresh data or update local state
        getAllUsersData()
      }
    } catch (error) {
      console.error('Failed to block/unblock user', error)
    }
  }

  useEffect(() => {
    getAllUsersData()
  }, [pagination.pageIndex, pagination.pageSize])

  // Hooks
  const { lang: locale } = useParams()

  const columns = useMemo(
    () => [
      {
        id: 'no',
        header: 'NO',
        cell: info => (info.table.getState().pagination.pageIndex * info.table.getState().pagination.pageSize) + info.row.index + 1
      },
      columnHelper.accessor('fullName', {
        header: 'USER',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {getAvatar({ avatar: row.original.image || row.original.avatar, fullName: row.original.name || row.original.fullName || 'User' })}
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.name || row.original.fullName}
              </Typography>
              <Typography variant='body2'>{row.original.username || row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('mobile', {
        header: 'CONTACT',
        cell: ({ row }) => (
          <div className='flex flex-col'>
            <Typography color='text.primary' className='font-medium'>
              {row.original.mobileNumber || 'N/A'}
            </Typography>
            <Typography variant='body2'>{row.original.email}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('uniqueId', {
        header: 'UNIQUE ID',
        cell: ({ row }) => <Typography>{row.original.uniqueId || row.original._id}</Typography>
      }),
      columnHelper.accessor('country', {
        header: 'COUNTRY',
        cell: ({ row }) => <Typography>{row.original.country || '-'}</Typography>
      }),
      columnHelper.accessor('totalOrder', {
        header: 'TOTAL ORDER',
        cell: ({ row }) => <Typography>{row.original.orderCount || 0}</Typography>
      }),
      columnHelper.accessor('createdAt', {
        header: 'REGISTER DATE',
        cell: ({ row }) => {
            const dateStr = row.original.createdAt || row.original.created_at || row.original.date
            if (!dateStr) return <Typography>N/A</Typography>
            const date = new Date(dateStr)
            return <Typography>{isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()}</Typography>
        }
      }),
      columnHelper.accessor('block', {
        header: 'BLOCK',
        cell: ({ row }) => (
          <Switch
            checked={row.original.isBlock}
            onChange={() => handleBlockUnblock(row.original._id || row.original.uniqueId)}
          />
        )
      }),
      columnHelper.accessor('action', {
        header: 'ACTION',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => window.location.href = `/${locale}/apps/user/view/${row.original._id}`}>
              <i className='tabler-eye text-textSecondary' />
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
      globalFilter,
      pagination
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    manualPagination: true,
    rowCount: total,
    onPaginationChange: setPagination,
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
      return (
        <CustomAvatar
          src={avatar}
          variant='rounded'
          skin='light'
          color='primary'
          size={34}
          sx={{
            backgroundColor: 'var(--mui-palette-primary-lightOpacity)',
            color: 'var(--mui-palette-primary-main)'
          }}
        />
      )
    } else {
      return (
        <CustomAvatar
          variant='rounded'
          skin='light'
          color='primary'
          size={34}
          sx={{
            backgroundColor: 'var(--mui-palette-primary-lightOpacity)',
            color: 'var(--mui-palette-primary-main)'
          }}
        >
          {getInitials(fullName)}
        </CustomAvatar>
      )
    }
  }

  return (
    <>
      <Card>
        <CardHeader title='Users' className='pbe-4' />
        {/* <TableFilters setData={setFilteredData} tableData={data} /> */}
<div className="flex flex-col md:flex-row md:justify-end items-end md:items-center p-3 border-bs gap-4">
  <DebouncedInput
    value={globalFilter ?? ''}
    onChange={value => setGlobalFilter(String(value))}
    placeholder="Search User"
    className="w-full md:w-[320px] lg:w-[400px] "
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
                        <>
                          <div
                            className={classnames('flex items-center justify-center', {
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
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.map(row => {
                    return (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className='text-center'>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
          </table>
        </div>

        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={total}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
        />
      </Card>
      <AddUserDrawer
        open={addUserOpen}
        handleClose={() => setAddUserOpen(!addUserOpen)}
        userData={data}
        setData={setData}
      />
    </>
  )
}

export default UserListTable
