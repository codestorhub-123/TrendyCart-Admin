'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'

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
import AddSubCategoryDrawer from './AddSubCategoryDrawer'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomAvatar from '@core/components/mui/Avatar'

// Service Imports
import { listAllSubCategories, deleteSubCategory, fetchActiveSubCategories } from '@/services/subCategoryService'
import { getApiBase } from '@/utils/getApiBase'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)
  useEffect(() => { setValue(initialValue) }, [initialValue])
  useEffect(() => {
    const timeout = setTimeout(() => { onChange(value) }, debounce)
    return () => clearTimeout(timeout)
  }, [value])
  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const columnHelper = createColumnHelper()

const SubCategoryTable = () => {
  // States
  const [addSubCategoryOpen, setAddSubCategoryOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editData, setEditData] = useState(null)

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()
  const searchParams = useSearchParams()
  const categoryId = searchParams.get('categoryId')
  const categoryName = searchParams.get('categoryName')

  const fetchData = async () => {
    setIsLoading(true)
    try {
        let res
        if (categoryId) {
          res = await listAllSubCategories(categoryId)
        } else {
          res = await fetchActiveSubCategories()
        }
        
        if (res && (res.status === true || res.success)) {
            setData(res.subCategories || res.subCategory || res.data || [])
        }
    } catch (err) {
        console.error(err)
    } finally {
        setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [categoryId])

  const handleDelete = async (id) => {
      if(window.confirm("Are you sure you want to delete this subcategory?")) {
          const res = await deleteSubCategory(id)
          if(res) {
              fetchData()
          }
      }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('no', {
        header: 'NO',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>
      }),
      columnHelper.accessor('image', {
        header: 'IMAGE',
        cell: ({ row }) => {
            const rawImage = row.original.image
            const base = getApiBase()
            let imageUrl = null
            
            if (rawImage) {
              if (rawImage.startsWith('http')) {
                 imageUrl = encodeURI(rawImage)
              } else {
                 const cleanBase = base.replace('/admin', '')
                 const cleanPath = rawImage.replace(/\\/g, '/')
                 imageUrl = `${cleanBase}/${cleanPath}`
              }
            }

            if (imageUrl) {
                return (
                    <img 
                        src={imageUrl} 
                        alt={row.original.name} 
                        className='w-[34px] h-[34px] rounded object-cover'
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = '/images/avatars/1.png' // Fallback
                        }}
                    />
                )
            }
            
            return <CustomAvatar size={34} variant="rounded" />
        }
      }),
      columnHelper.accessor('name', {
        header: 'SUB CATEGORY',
        cell: ({ row }) => (
            <Typography className='font-medium' color='text.primary'>
              {row.original.name}
            </Typography>
        )
      }),
      columnHelper.accessor('product', {
        header: 'PRODUCT',
        cell: ({ row }) => <Typography>{row.original.sameSubcategoryProductCount || 0}</Typography>
      }),
      columnHelper.accessor('edit', {
        header: 'EDIT',
        cell: ({ row }) => (
            <IconButton onClick={() => {
                const rowData = row.original
                // Try to ensure we have an ID
                if (!rowData._id && (rowData.id || rowData.subCategoryId)) {
                    rowData._id = rowData.id || rowData.subCategoryId
                }
                setEditData(rowData)
                setAddSubCategoryOpen(true)
            }}>
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
        )
      }),
      columnHelper.accessor('delete', {
        header: 'DELETE',
        cell: ({ row }) => (
            <IconButton onClick={() => {
                const subId = row.original._id || row.original.id || row.original.subCategoryId
                handleDelete(subId)
            }}>
              <i className='tabler-trash text-error' />
            </IconButton>
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
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
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
        <div className='flex flex-wrap justify-between gap-4 p-6'>
          <Typography variant='h5'>Sub Category</Typography>
          <div className='flex gap-4'>
             <Button variant='tonal' color='secondary' onClick={() => router.back()} startIcon={<i className='tabler-arrow-left' />}>
                Back
             </Button>
             <Button
                variant='contained'
                onClick={() => {
                    setEditData(null)
                    setAddSubCategoryOpen(true)
                }}
                startIcon={<i className='tabler-plus' />}
              >
                Add Sub Category
              </Button>
          </div>
        </div>
        <div className='flex flex-wrap justify-between gap-4 px-6 pb-6'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search'
            className='max-sm:is-full'
          />
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='sm:is-[70px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='15'>15</MenuItem>
            <MenuItem value='25'>25</MenuItem>
          </CustomTextField>
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
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                   <td colSpan={columns.length} className='text-center'>No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={data.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
        />
      </Card>
      <AddSubCategoryDrawer
        open={addSubCategoryOpen}
        handleClose={() => setAddSubCategoryOpen(false)}
        onSuccess={fetchData}
        categoryId={categoryId}
        subCategoryData={editData}
      />
    </>
  )
}

export default SubCategoryTable
