'use client'

import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Pagination from '@mui/material/Pagination'

import { toast } from 'react-hot-toast'

import CustomTextField from '@core/components/mui/TextField'

import tableStyles from '@core/styles/table.module.css'

import { getBanks, createBank, updateBank, deleteBank } from '@/services/bankService'

const BankSetting = () => {
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editId, setEditId] = useState(null)
    const [formData, setFormData] = useState({ name: '' })
    const [isSubmitLoading, setIsSubmitLoading] = useState(false)
    
    // Pagination
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const fetchData = async () => {
        setIsLoading(true)

        const res = await getBanks()

        if (res && res.status === true) {
            setData(res.bank || [])
        }

        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleOpen = (item = null) => {
        if (item) {
            setEditId(item._id)
            setFormData({ name: item.name })
        } else {
            setEditId(null)
            setFormData({ name: '' })
        }

        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setFormData({ name: '' })
    }

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error('Bank Name is required')

            return
        }

        setIsSubmitLoading(true)
        
        let res
        if (editId) {
            res = await updateBank(editId, formData)
        } else {
            res = await createBank(formData)
        }

        if (res && res.status === true) {
            toast.success(res.message || 'Success')
            fetchData()
            handleClose()
        } else {
            toast.error(res.message || 'Failed')
        }

        setIsSubmitLoading(false)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete?')) {
            const res = await deleteBank(id)
            if (res && res.status === true) {
                toast.success('Deleted successfully')
                fetchData()
            } else {
                toast.error(res.message || 'Delete failed')
            }
        }
    }

    return (
        <Card>
            <CardHeader title='Bank Setting' />
            <div className='p-6 pt-0'>
                <Button variant='contained' onClick={() => handleOpen()} startIcon={<i className='tabler-plus' />}>
                    Add
                </Button>
            </div>
            
            <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                    <thead>
                        <tr>
                            <th>NO</th>
                            <th>BANK NAME</th>
                            <th>CREATED DATE</th>
                            <th>EDIT</th>
                            <th>DELETE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className='text-center'>
                                    <Typography>Loading...</Typography>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={5} className='text-center'>
                                    <Typography>No banks found.</Typography>
                                </td>
                            </tr>
                        ) : (
                            data
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((item, index) => (
                                <tr key={item._id}>
                                    <td>{(page * rowsPerPage) + index + 1}</td>
                                    <td>
                                        <Typography color='text.primary'>{item.name}</Typography>
                                    </td>
                                    <td>
                                        <Typography variant='body2'>
                                            {new Date(item.createdAt).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </Typography>
                                    </td>
                                    <td>
                                        <IconButton onClick={() => handleOpen(item)}>
                                            <i className='tabler-edit text-textSecondary' />
                                        </IconButton>
                                    </td>
                                    <td>
                                         <IconButton onClick={() => handleDelete(item._id)} color='error'>
                                            <i className='tabler-trash' />
                                        </IconButton>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2 p-6 border-t'>
                <Typography color='text.disabled'>
                    {`Showing ${data.length === 0 ? 0 : (page * rowsPerPage + 1)} to ${Math.min((page + 1) * rowsPerPage, data.length)} of ${data.length} entries`}
                </Typography>
                <Pagination
                    shape='rounded'
                    color='primary'
                    variant='tonal'
                    count={Math.ceil(data.length / rowsPerPage)}
                    page={page + 1}
                    onChange={(e, newPage) => setPage(newPage - 1)}
                    showFirstButton
                    showLastButton
                />
            </div>

            <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
                <DialogTitle>{editId ? 'Edit Bank' : 'Add Bank'}</DialogTitle>
                <DialogContent className='pt-6'>
                     <CustomTextField 
                        label='Bank Name'
                        value={formData.name}
                        onChange={e => setFormData({ name: e.target.value })}
                        fullWidth
                     />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color='secondary'>Cancel</Button>
                    <Button onClick={handleSubmit} variant='contained' disabled={isSubmitLoading}>
                        {isSubmitLoading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    )
}

export default BankSetting
