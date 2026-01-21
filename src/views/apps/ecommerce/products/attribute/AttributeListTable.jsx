'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import TablePaginationComponent from '@components/TablePaginationComponent'
import AddAttributeDialog from './AddAttributeDialog'

// Service Imports
import { listAllAttributes, destroyAttribute, insertAttributes, updateAttributes } from '@/services/attributeService'
import { fetchActiveSubCategories } from '@/services/subCategoryService'
import { getApiBase } from '@/utils/getApiBase'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const fieldTypeMap = {
  1: 'Text Input',
  2: 'Number Input',
  3: 'File Input',
  4: 'Radio',
  5: 'Dropdown',
  6: 'Checkboxes'
}

const columnHelper = createColumnHelper()

const AttributeListTable = () => {
  // States
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [subCategories, setSubCategories] = useState([])
  const [subCategoryId, setSubCategoryId] = useState('')
  const [fieldType, setFieldType] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAttribute, setSelectedAttribute] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await listAllAttributes(subCategoryId, fieldType)
      if (res && res.status) {
        // Flatten the attributes from the API response
        const flattenedData = (res.attributes || []).flatMap(item => 
          (item.attributes || []).map(attr => ({
            ...attr,
            subCategory: item.subCategory, // Attach parent subCategory info
            createdAt: item.createdAt,
            parent_id: item._id
          }))
        )
        setData(flattenedData)

      }
    } catch (error) {
      console.error('Error fetching attributes:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubCategories = async () => {
    try {
      const res = await fetchActiveSubCategories()
      if (res && res.status) {
        setSubCategories(res.subCategories || [])
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    }
  }

  useEffect(() => {
    fetchData()
    fetchSubCategories()
  }, [])

  useEffect(() => {
    fetchData()
  }, [subCategoryId, fieldType])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attribute?')) {
      try {
        const res = await destroyAttribute(id)
        if (res.status) {
          fetchData()
        }
      } catch (error) {
        console.error('Error deleting attribute:', error)
      }
    }
  }

  const handleEdit = (attribute) => {
    setSelectedAttribute(attribute)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedAttribute(null)
  }

  const handleDialogSubmit = async (formData, isEdit) => {
    try {
      const apiCall = isEdit ? updateAttributes : insertAttributes
      const res = await apiCall(formData)
      if (res && res.status) {
        handleDialogClose()
        fetchData()
      } else {
        alert(res.message || 'Operation failed')
      }
    } catch (error) {
      console.error('Error saving attribute:', error)
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
               imageUrl = rawImage
            } else {
               const cleanBase = base.replace('/admin', '')
               const cleanPath = rawImage.replace(/\\/g, '/')
               imageUrl = `${cleanBase}/${cleanPath}`
            }
          }
          // console.log('Image Debug:', { rawImage, base, imageUrl })
          return <CustomAvatar src={imageUrl} size={34} variant='rounded' />
        }
      }),
      columnHelper.accessor('name', {
        header: 'NAME',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.name}</Typography>
      }),
      columnHelper.accessor('subCategory', {
        header: 'SUBCATEGORY',
        cell: ({ row }) => <Typography>{row.original.subCategory?.name || '-'}</Typography>
      }),
      columnHelper.accessor('fieldType', {
        header: 'TYPE',
        cell: ({ row }) => <Typography>{fieldTypeMap[row.original.fieldType] || row.original.fieldType}</Typography>
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
      columnHelper.accessor('edit', {
        header: 'EDIT',
        cell: ({ row }) => (
          <IconButton size='small' onClick={() => handleEdit(row.original)}>
            <i className='tabler-edit text-textSecondary' />
          </IconButton>
        ),
        enableSorting: false
      }),
      columnHelper.accessor('delete', {
        header: 'DELETE',
        cell: ({ row }) => (
          <IconButton size='small' onClick={() => handleDelete(row.original._id)}>
            <i className='tabler-trash text-error' />
          </IconButton>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardHeader
        title='Attribute'
        action={
          <Button variant='contained' startIcon={<i className='tabler-plus' />} onClick={() => setIsDialogOpen(true)}>
            Add
          </Button>
        }
      />
      <div className='flex justify-between flex-wrap p-6 gap-4'>
        <CustomTextField
          select
          label='Subcategory'
          value={subCategoryId}
          onChange={e => setSubCategoryId(e.target.value)}
          className='is-full sm:is-[250px]'
          placeholder='Select Subcategory...'
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value=''>Select Subcategory</MenuItem>
          {subCategories.map(sub => {
            const id = sub.subCategoryId || sub._id
            const catName = typeof sub.category === 'object' ? sub.category?.name : sub.category
            return (
              <MenuItem key={id} value={id}>
                {catName ? `${sub.name}` : sub.name}
              </MenuItem>
            )
          })}
        </CustomTextField>
        <CustomTextField
          select
          label='Field Type'
          value={fieldType}
          onChange={e => setFieldType(e.target.value)}
          className='is-full sm:is-[250px]'
          placeholder='Select field type...'
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value=''>Select Field Type</MenuItem>
          {Object.entries(fieldTypeMap).map(([key, value]) => (
            <MenuItem key={key} value={key}>{value}</MenuItem>
          ))}
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
            {loading ? (
              <tr>
                <td colSpan={columns.length} className='text-center p-10'>
                  Loading Attributes...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='text-center p-10'>
                  No Attributes Found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        component={() => <TablePaginationComponent table={table} />}
        count={data.length}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
      />
      
      {/* Add/Edit Dialog */}
      <AddAttributeDialog
        open={isDialogOpen}
        handleClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        attributeData={selectedAttribute}
        subCategories={subCategories}
      />
    </Card>
  )
}

export default AttributeListTable
