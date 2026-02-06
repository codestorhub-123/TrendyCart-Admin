'use client'

// React Imports
import { useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import Typography from '@mui/material/Typography'

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
import { useSelector } from 'react-redux'

// Component Imports
import Link from '@components/Link'

// Util Imports
// Util Imports
import { getImageUrl } from '@/utils/imageUrl'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

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

const orderData = [
  {
    productName: 'OnePlus 7 Pro',
    productImage: '/images/apps/ecommerce/product-21.png',
    brand: 'OnePluse',
    price: 799,
    quantity: 1,
    total: 799
  },
  {
    productName: 'Magic Mouse',
    productImage: '/images/apps/ecommerce/product-22.png',
    brand: 'Google',
    price: 89,
    quantity: 1,
    total: 89
  },
  {
    productName: 'Wooden Chair',
    productImage: '/images/apps/ecommerce/product-23.png',
    brand: 'Insofar',
    price: 289,
    quantity: 2,
    total: 578
  },
  {
    productName: 'Air Jorden',
    productImage: '/images/apps/ecommerce/product-24.png',
    brand: 'Nike',
    price: 299,
    quantity: 2,
    total: 598
  }
]

// Column Definitions
const columnHelper = createColumnHelper()

const OrderTable = ({ data, currency }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

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
      columnHelper.accessor('productId.productName', {
        header: 'Product',
        cell: ({ row }) => {
          const product = row.original.productId
          return (
            <div className='flex items-center gap-3'>
              <img src={getImageUrl(product?.mainImage)} alt={product?.productName} height={34} className='rounded' />
              <div className='flex flex-col items-start'>
                <Typography color='text.primary' className='font-medium'>
                  {product?.productName || 'Unnamed Product'}
                </Typography>
                <Typography variant='body2'>{product?.brand || ''}</Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('purchasedTimeProductPrice', {
        header: 'Price',
        cell: ({ row }) => <Typography>{`${currency}${row.original.purchasedTimeProductPrice}`}</Typography>
      }),
      columnHelper.accessor('totalQuantity', {
        header: 'Qty',
        cell: ({ row }) => {
          const qty = row.original.productQuantity || row.original.quantity || row.original.totalQuantity || row.original.itemQuantity || 0
          return <Typography>{`${qty}`}</Typography>
        }
      }),
      columnHelper.accessor('totalPrice', {
        header: 'Total',
        cell: ({ row }) => {
          const qty = row.original.productQuantity || row.original.quantity || row.original.totalQuantity || row.original.itemQuantity || 0
          return <Typography>{`${currency}${qty * (row.original.purchasedTimeProductPrice || 0)}`}</Typography>
        }
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currency]
  )

  const table = useReactTable({
    data: data,
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
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
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
              <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                No data available
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody className='border-be'>
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
    </div>
  )
}

const OrderDetailsCard = ({ orderData }) => {
  const { currency } = useSelector(state => state.settingsReducer)

  return (
    <Card>
      <CardHeader
        title='Order Details'
      />
      <OrderTable data={orderData?.items || []} currency={currency} />
      <CardContent className='flex justify-end'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-12 justify-between'>
            <Typography color='text.primary' className='min-is-[100px]'>
              Subtotal:
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              {currency}{orderData?.subTotal || 0}
            </Typography>
          </div>
          <div className='flex items-center gap-12 justify-between'>
            <Typography color='text.primary' className='min-is-[100px]'>
              Shipping Fee:
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              {currency}{orderData?.totalShippingCharges || 0}
            </Typography>
          </div>
          <div className='flex items-center gap-12 justify-between border-bs pbs-2'>
            <Typography color='text.primary' className='font-medium min-is-[100px]'>
              Total:
            </Typography>
            <Typography color='text.primary' className='font-medium'>
              {currency}{orderData?.finalTotal || 0}
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderDetailsCard
