'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
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

import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import { getAllPromoCodes, deletePromoCode } from '@/services/promoCodeService'
import AddPromoCodeDrawer from './AddPromoCodeDrawer'
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

const PromoCodeTable = () => {
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [addPromoCodeOpen, setAddPromoCodeOpen] = useState(false)
  const [editData, setEditData] = useState(null)

  const fetchData = async () => {
    setIsLoading(true)
    const res = await getAllPromoCodes()
    if (res && res.status === true) {
      setData(res.promoCode || res.data || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this promo code?')) {
      const res = await deletePromoCode(id)
      if (res && res.status === true) {
        fetchData()
      } else {
        alert(res?.message || 'Failed to delete promo code')
      }
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('no', {
        header: 'NO',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>
      }),
      columnHelper.accessor('promoCode', {
        header: 'PROMO CODE',
        cell: ({ row }) => <Typography color='primary' className='font-medium'>{row.original.promoCode}</Typography>
      }),
      columnHelper.accessor('discountAmount', {
        header: 'DISCOUNT',
        cell: ({ row }) => {
          const { discountAmount, discountType } = row.original
          return (
            <Typography>
              {discountType === 2 ? `${discountAmount}%` : `$ ${discountAmount}`}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('minOrderValue', {
        header: 'MIN. ORDER VALUE',
        cell: ({ row }) => <Typography>$ {row.original.minOrderValue || 0}</Typography>
      }),
      columnHelper.accessor('conditions', {
        header: 'CONDITIONS',
        cell: ({ row }) => (
          <div className='min-w-[200px]'>
            {(row.original.conditions || []).map((condition, index) => (
              <Typography 
                key={index} 
                variant='body2' 
                className='flex items-start gap-1 whitespace-normal break-words py-1'
              >
                <i className='tabler-check text-success text-[14px] mt-1' />
                {condition}
              </Typography>
            ))}
          </div>
        )
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
      columnHelper.accessor('actions', {
        header: 'ACTIONS',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton onClick={() => {
              setEditData(row.original)
              setAddPromoCodeOpen(true)
            }}>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
            <IconButton onClick={() => handleDelete(row.original._id || row.original.promoCodeId)}>
              <i className='tabler-trash text-error' />
            </IconButton>
          </div>
        )
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
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
        title='PromoCode' 
        action={
          <Button 
            variant='contained' 
            startIcon={<i className='tabler-plus' />}
            onClick={() => {
              setEditData(null)
              setAddPromoCodeOpen(true)
            }}
          >
            Add
          </Button>
        }
      />
      <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
        <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Promo Code'
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
      <AddPromoCodeDrawer
        open={addPromoCodeOpen}
        handleClose={() => setAddPromoCodeOpen(false)}
        onSuccess={fetchData}
        promoCodeData={editData}
      />
    </Card>
  )
}

export default PromoCodeTable
