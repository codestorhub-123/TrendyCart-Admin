'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
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

// Component Imports
import AddCategoryDrawer from './AddCategoryDrawer'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomAvatar from '@core/components/mui/Avatar' // Added for Image

// Service Imports
import { getAllCategories, deleteCategory } from '@/services/categoryService'
import { getImageUrl } from '@/utils/imageUrl'
import { getInitials } from '@/utils/getInitials'

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

// Column Definitions
const columnHelper = createColumnHelper()

const ProductCategoryTable = () => {
  // States
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editData, setEditData] = useState(null)

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()

  const fetchData = async () => {
    setIsLoading(true)
    try {
        const res = await getAllCategories()
        if (res && (res.status === true || res.data)) {
            // Adjust based on actual API response key (res.data or res)
            setData(res.category || res.data || [])
        } else {
            console.error("Failed to fetch categories", res)
            setData([])
        }
    } catch (err) {
        console.error(err)
    } finally {
        setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id) => {
      if(window.confirm("Are you sure you want to delete this category?")) {
          const res = await deleteCategory(id)
          if(res) {
              fetchData()
          }
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
      columnHelper.accessor('no', {
        header: 'NO',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>
      }),
      columnHelper.accessor('image', {
        header: 'IMAGE',
        cell: ({ row }) => {
            const rawImage = row.original.image
            return (
                <CustomAvatar 
                    src={getImageUrl(rawImage)} 
                    size={34} 
                    variant="rounded"
                    skin='light'
                    color='primary'
                >
                    {getInitials(row.original.name || '-')}
                </CustomAvatar>
            )
        }
      }),
      columnHelper.accessor('name', {
        header: 'CATEGORY',
        cell: ({ row }) => (
            <Typography className='font-medium' color='text.primary'>
              {row.original.name}
            </Typography>
        )
      }),
      columnHelper.accessor('product', {
        header: 'PRODUCT',
        cell: ({ row }) => <Typography>{row.original.categoryProduct}</Typography> // Placeholder as API doesn't return count yet
      }),
      columnHelper.accessor('subCategory', {
        header: 'SUB CATEGORY',
        cell: ({ row }) => <Typography>{row.original.totalSubcategory || 0}</Typography>
      }),
      columnHelper.accessor('addSubCategory', {
        header: 'ADD SUBCATEGORY',
        cell: ({ row }) => (
          <IconButton onClick={() => router.push(`/${locale}/category/subCategory?categoryId=${row.original._id}&categoryName=${encodeURIComponent(row.original.name)}`)}>
            <i className='tabler-plus text-textSecondary' />
          </IconButton>
        )
      }),
      columnHelper.accessor('edit', {
        header: 'EDIT',
        cell: ({ row }) => (
            <IconButton onClick={() => {
                setEditData(row.original)
                setAddCategoryOpen(true)
            }}>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
        )
      }),
      columnHelper.accessor('delete', {
        header: 'DELETE',
        cell: ({ row }) => (
            <IconButton onClick={() => handleDelete(row.original._id)}>
              <i className='tabler-trash text-error' />
            </IconButton>
        )
      }),
       columnHelper.accessor('info', {
        header: 'INFO',
        cell: ({ row }) => (
          <IconButton onClick={() => router.push(`/${locale}/category/subCategory?categoryId=${row.original._id}&categoryName=${encodeURIComponent(row.original.name)}`)}>
            <i className='tabler-info-circle text-textSecondary' />
          </IconButton>
        )
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
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
    <>
      <Card>
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search'
            className='max-sm:is-full'
          />
          <div className='flex max-sm:flex-col items-start sm:items-center gap-4 max-sm:is-full'>
            <CustomTextField
              select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className='flex-auto max-sm:is-full sm:is-[70px]'
            >
              <MenuItem value='10'>10</MenuItem>
              <MenuItem value='15'>15</MenuItem>
              <MenuItem value='25'>25</MenuItem>
            </CustomTextField>
            <Button
              variant='contained'
              className='max-sm:is-full'
              onClick={() => {
                setEditData(null)
                setAddCategoryOpen(true)
              }}
              startIcon={<i className='tabler-plus' />}
            >
              Add Category
            </Button>
          </div>
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
      <AddCategoryDrawer
        open={addCategoryOpen}
        categoryData={editData}
        onSuccess={fetchData}
        handleClose={() => setAddCategoryOpen(false)}
      />
    </>
  )
}

export default ProductCategoryTable
