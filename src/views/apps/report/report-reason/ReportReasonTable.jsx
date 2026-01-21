'use client'

import { useState, useEffect, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel
} from '@tanstack/react-table'

import TablePaginationComponent from '@components/TablePaginationComponent'
import { getReportReasons, createReportReason, updateReportReason, deleteReportReason } from '@/services/reportReasonService'

import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const ReportReasonTable = () => {
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [currentReason, setCurrentReason] = useState(null) // null for add, object for edit
    const [title, setTitle] = useState('')
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })

    const fetchData = async () => {
        setIsLoading(true)
        try {
            // Using pageIndex + 1 for start as the API likely expects a page number, not an offset
            const start = pagination.pageIndex + 1
            const limit = pagination.pageSize
            const res = await getReportReasons(start, limit)
            if (res && res.status) {
                setData(res.data || [])
                setTotal(res.total || 0)
            } else {
                setData([])
                setTotal(0)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [pagination.pageIndex, pagination.pageSize])

    const handleOpenDialog = (reason = null) => {
        setCurrentReason(reason)
        setTitle(reason ? reason.title : '')
        setOpenDialog(true)
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
        setCurrentReason(null)
        setTitle('')
    }

    const handleSubmit = async () => {
        if (!title.trim()) return

        let res
        if (currentReason) {
            res = await updateReportReason(currentReason._id, { title })
        } else {
            res = await createReportReason({ title })
        }

        if (res.status) {
            fetchData()
            handleCloseDialog()
        } else {
            alert(res.message || 'Operation failed')
        }
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this reason?')) {
            const res = await deleteReportReason(id)
            if (res.status) {
                fetchData()
            } else {
                alert(res.message || 'Delete failed')
            }
        }
    }

    const columns = useMemo(() => [
        columnHelper.accessor('rowNumber', {
            header: 'NO',
            cell: info => (pagination.pageIndex * pagination.pageSize) + info.row.index + 1
        }),
        columnHelper.accessor('title', {
            header: 'TITLE',
            cell: info => info.getValue()
        }),
        columnHelper.display({
            id: 'edit',
            header: 'EDIT',
            cell: ({ row }) => (
                <IconButton onClick={() => handleOpenDialog(row.original)}>
                    <i className="tabler-pencil" />
                </IconButton>
            )
        }),
        columnHelper.display({
            id: 'delete',
            header: 'DELETE',
            cell: ({ row }) => (
                <IconButton onClick={() => handleDelete(row.original._id)} color="error">
                    <i className="tabler-trash-filled" />
                </IconButton>
            )
        })
    ], [data, pagination])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        rowCount: total,
        manualPagination: true,
        onPaginationChange: setPagination,
        state: {
            pagination
        }
    })

    return (
        <Card>
            <CardHeader 
                title='Report Reason'
                action={
                    <Button variant='contained' onClick={() => handleOpenDialog()}>
                        + Add
                    </Button>
                }
            />
            <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className='text-center border-be-0 p-10'>
                                    <Typography color='text.secondary'>No Reasons Found</Typography>
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <TablePaginationComponent table={table} />

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{currentReason ? 'Edit Reason' : 'Add Reason'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {currentReason ? 'Update' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    )
}

export default ReportReasonTable
