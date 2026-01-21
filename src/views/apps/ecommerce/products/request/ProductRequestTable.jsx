'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
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
import { 
  getCreateProductRequestsByStatus, 
  acceptCreateRequest,
  getProductRequestsByStatus,
  acceptOrRejectRequest
} from '@/services/productRequestService'
import { getApiBase } from '@/utils/getApiBase'
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

const ProductRequestTable = ({ status }) => {
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('new') // 'new' | 'updated'
  const { currency } = useSelector(state => state.settingsReducer)

  const fetchData = async () => {
    setIsLoading(true)
    console.log(`ProductRequestTable: Fetching ${activeTab} data for status:`, status)
    
    let res
    if (activeTab === 'new') {
      res = await getCreateProductRequestsByStatus(status)
    } else {
      res = await getProductRequestsByStatus(status)
    }

    console.log('ProductRequestTable: API Response:', res)
    if (res && res.status === true) {
      // Handle various possible response keys
      setData(res.productRequests || res.productCreationRequests || res.productCreation || res.product || res.products || res.data || [])
    } else {
        setData([])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [status, activeTab])

  const handleAccept = async (requestId) => {
    if (window.confirm('Are you sure you want to approve this request?')) {
      let res
      if (activeTab === 'new') {
        res = await acceptCreateRequest(requestId, 'Approved')
      } else {
        res = await acceptOrRejectRequest(requestId, 'Approved')
      }

      if (res && res.status === true) {
        fetchData()
      } else {
        alert(res?.message || 'Failed to approve request')
      }
    }
  }

  const handleReject = async (requestId) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      let res
      if (activeTab === 'new') {
         res = await acceptCreateRequest(requestId, 'Rejected')
      } else {
         res = await acceptOrRejectRequest(requestId, 'Rejected')
      }

      if (res && res.status === true) {
        fetchData()
      } else {
        alert(res?.message || 'Failed to reject request')
      }
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('no', {
        header: 'NO',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>
      }),
      columnHelper.accessor('productName', {
        header: 'PRODUCT',
        enableGlobalFilter: true,
        cell: ({ row }) => {
          const imageUrl = row.original.mainImage || '/images/placeholder.png'
          
          return (
            <div className='flex items-center gap-3'>
              <Avatar src={imageUrl} alt={row.original.productName || 'Product'} variant='rounded' />
              <Typography className='font-medium'>{row.original.productName || '-'}</Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('productCode', {
        header: 'PRODUCT CODE',
        enableGlobalFilter: true,
        cell: ({ row }) => <Typography>{row.original.productCode || '-'}</Typography>
      }),
      columnHelper.accessor('price', {
        header: `PRICE (${currency})`,
        cell: ({ row }) => <Typography>{currency} {row.original.price || 0}</Typography>
      }),
      columnHelper.accessor('shippingCharges', {
        header: `SHIPPING CHARGES (${currency})`,
        cell: ({ row }) => <Typography>{currency} {row.original.shippingCharges || 0}</Typography>
      }),
      columnHelper.accessor('createdAt', {
        header: 'CREATED DATE',
        cell: ({ row }) => (
          <Typography>
            {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }) : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor(activeTab === 'new' ? 'createStatus' : 'updateStatus', {
        header: activeTab === 'new' ? 'CREATE STATUS' : 'UPDATE STATUS',
        cell: ({ row }) => {
          const status = activeTab === 'new' 
            ? (row.original.createStatus || row.original.status || 'Pending')
            : (row.original.updateStatus || row.original.status || 'Pending')
            
          const colorMap = {
            Pending: 'warning',
            Approved: 'success',
            Rejected: 'error'
          }
          return <Chip label={status} color={colorMap[status] || 'default'} size='small' variant='tonal' />
        }
      }),
      ...(status === 'Pending' ? [
        columnHelper.accessor('accept', {
          header: 'ACCEPT',
          cell: ({ row }) => (
            <IconButton onClick={() => handleAccept(row.original._id || row.original.requestId)} color='success'>
              <i className='tabler-check' />
            </IconButton>
          )
        }),
        columnHelper.accessor('reject', {
          header: 'REJECT',
          cell: ({ row }) => (
            <IconButton onClick={() => handleReject(row.original._id || row.original.requestId)} color='error'>
              <i className='tabler-x' />
            </IconButton>
          )
        })
      ] : [])
    ],
    [data, status, currency, activeTab]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'fuzzy',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardHeader 
        title={`${status} Product Requests`}
      />
      <Box sx={{ display: 'flex', gap: 0, borderBottom: 1, borderColor: 'divider', px: 6, pt: 2 }}>
        <Button 
          variant={activeTab === 'new' ? 'contained' : 'text'} 
          onClick={() => setActiveTab('new')}
          sx={{ 
            borderBottomLeftRadius: 0, 
            borderBottomRightRadius: 0,
            bgcolor: activeTab === 'new' ? 'var(--mui-palette-primary-lightOpacity)' : 'transparent',
            color: activeTab === 'new' ? 'var(--mui-palette-primary-main)' : 'text.secondary' 
          }}
        >
          New Items
        </Button>
        <Button 
          variant={activeTab === 'updated' ? 'contained' : 'text'} 
          onClick={() => setActiveTab('updated')}
          sx={{ 
            borderBottomLeftRadius: 0, 
            borderBottomRightRadius: 0,
            bgcolor: activeTab === 'updated' ? 'var(--mui-palette-primary-lightOpacity)' : 'transparent',
             color: activeTab === 'updated' ? 'var(--mui-palette-primary-main)' : 'text.secondary' 
          }}
        >
          Updated Items
        </Button>
      </Box>
      <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 gap-4'>
        <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search...'
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
      <TablePaginationComponent
        table={table}
      />
    </Card>
  )
}

export default ProductRequestTable
