'use client'

import { useState, useEffect, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import CustomAvatar from '@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import { getImageUrl } from '@/utils/imageUrl'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import TablePaginationComponent from '@components/TablePaginationComponent'
import { reportsOfReel, resolveReport, deleteReport } from '@/services/reelService'
import { format } from 'date-fns'

import tableStyles from '@core/styles/table.module.css'

const columnHelper = createColumnHelper()

const ReelsReportTable = () => {
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10
    })
    const [status, setStatus] = useState('All')
    const [isLoading, setIsLoading] = useState(false)
    
    // Dialog State
    const [openView, setOpenView] = useState(false)
    const [selectedVideo, setSelectedVideo] = useState('')

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const queryParams = {
                status: status,
                start: pagination.pageIndex * pagination.pageSize,
                limit: pagination.pageSize
            }
            const res = await reportsOfReel(queryParams)
            if (res && res.status) {
                setData(res.reportOfReels || []) 
                setTotal(res.totalReportOfReels || 0)
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
    }, [pagination.pageIndex, pagination.pageSize, status])

    const handleResolve = async (reportId) => {
        if (confirm('Are you sure you want to resolve this report?')) {
            const res = await resolveReport(reportId)
            if (res.status) {
                fetchData()
            } else {
                alert(res.message || 'Resolve failed')
            }
        }
    }

    const handleDelete = async (reportId, reelId) => {
        if (confirm('Are you sure you want to delete this report?')) {
            const res = await deleteReport(reportId)
            if (res.status) {
                fetchData()
            } else {
                alert(res.message || 'Delete failed')
            }
        }
    }

    const handleVideoClick = (videoUrl) => {
        if (videoUrl) {
            setSelectedVideo(videoUrl)
            setOpenView(true)
        }
    }

    const columns = useMemo(() => [
        columnHelper.accessor('rowNumber', {
            header: 'NO',
            cell: info => (pagination.pageIndex * pagination.pageSize) + info.row.index + 1
        }),
        columnHelper.accessor('reelId.video', {
            header: 'VIDEO',
            cell: ({ row }) => {
                const thumbnail = row.original.reelId?.thumbnail
                const videoUrl = row.original.reelId?.video
                return (
                    <div 
                        onClick={() => handleVideoClick(videoUrl)}
                        style={{ width: 50, height: 50, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
                    >
                         {thumbnail ? (
                            <img src={getImageUrl(thumbnail)} alt="thumbnail" className="w-full h-full object-cover" />
                        ) : (
                             <div className="w-full h-full bg-gray-200" />
                        )}
                        <i className="tabler-player-play-filled items-center justify-center flex absolute text-white" style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: 4 }} />
                    </div>
                )
            }
        }),
        columnHelper.accessor('userId', {
            header: 'USER',
            cell: ({ row }) => {
                const user = row.original.userId
                const fullName = user ? `${user.firstName || ''}`.trim() : 'Unknown User'
                
                return (
                    <div className="flex items-center gap-2">
                        <CustomAvatar size={34}>
                            {getInitials(fullName)}
                        </CustomAvatar>
                        <Typography color="text.primary">{fullName}</Typography>
                    </div>
                )
            }
        }),
        columnHelper.accessor('description', {
            header: 'DESCRIPTION',
            cell: info => info.getValue() || '-'
        }),
        columnHelper.accessor('status', {
            header: 'STATUS',
            cell: info => {
                const val = info.getValue()
                if (val === 1 || val === '1') return 'Pending'
                if (val === 2 || val === '2') return 'Solved'
                return val || 'Pending'
            }
        }),
        columnHelper.accessor('createdAt', {
            header: 'VIDEO REPORTED',
            cell: info => info.getValue() ? format(new Date(info.getValue()), 'dd/MM/yyyy') : '-'
        }),
        columnHelper.display({
            id: 'actions',
            header: 'ACTION',
            cell: ({ row }) => {
                const status = row.original.status
                const isSolved = status === 2 || status === '2' || status === 'Solved'
                
                if (isSolved) {
                    return <Typography color='text.primary' className='font-medium'>Resolved</Typography>
                }

                return (
                    <div className="flex items-center gap-2">
                        <IconButton onClick={() => handleResolve(row.original._id)} color="success">
                            <i className="tabler-circle-check-filled" />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(row.original._id, row.original.reelId?._id)} color="error">
                            <i className="tabler-circle-x-filled" />
                        </IconButton>
                    </div>
                )
            }
        })
    ], [pagination])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        pageCount: Math.ceil(total / pagination.pageSize),
        rowCount: total,
        state: {
            pagination
        },
        onPaginationChange: setPagination,
        manualPagination: true
    })

    return (
        <Card>
            <CardHeader 
                title='Reels Report'
                action={
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                        >
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="Solved">Solved</MenuItem>
                        </Select>
                    </FormControl>
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
                                    <Typography color='text.secondary'>No Reports Found</Typography>
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
            
            <Dialog 
                open={openView} 
                onClose={() => setOpenView(false)}
                fullWidth
                maxWidth='sm'
            >
                <DialogTitle className='flex justify-between items-center'>
                    Video
                    <IconButton onClick={() => setOpenView(false)} size='small'>
                        <i className='tabler-x' />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedVideo ? (
                        <div className="flex justify-center items-center bg-black rounded overflow-hidden">
                             <video 
                                src={getImageUrl(selectedVideo)} 
                                controls 
                                autoPlay
                                className='max-h-[70vh] w-auto' 
                            />
                        </div>
                    ) : (
                        <div className="p-4 text-center">No video URL available</div>
                    )}
                </DialogContent>
                <DialogActions className='justify-end'>
                    <Button onClick={() => setOpenView(false)} variant='tonal' color='secondary'>Close</Button>
                </DialogActions>
            </Dialog>
        </Card>
    )
}

export default ReelsReportTable
