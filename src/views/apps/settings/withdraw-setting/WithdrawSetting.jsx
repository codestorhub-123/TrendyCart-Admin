'use client'

import { useEffect, useState } from 'react'
import { getImageUrl } from '@/utils/imageUrl'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import { toast } from 'react-hot-toast'

// Table Imports
import Pagination from '@mui/material/Pagination'

import tableStyles from '@core/styles/table.module.css'

import { 
    getWithdrawMethods, 
    createWithdrawMethod, 
    updateWithdrawMethod, 
    deleteWithdrawMethod, 
    toggleWithdrawMethod 
} from '@/services/withdrawService'

const WithdrawSetting = () => {
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editId, setEditId] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        details: [], // Array of strings
        image: null,
        preview: null
    })
    const [detailInput, setDetailInput] = useState('')
    const [isSubmitLoading, setIsSubmitLoading] = useState(false)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const fetchData = async () => {
        setIsLoading(true)
        const res = await getWithdrawMethods()
        if (res && res.status === true) {
            setData(res.withdraw || [])
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleOpen = (item = null) => {
        if (item) {
            setEditId(item._id)
            setFormData({
                name: item.name,
                details: Array.isArray(item.details) ? item.details : [],
                image: null,
                preview: item.image
            })
        } else {
            setEditId(null)
            setFormData({ name: '', details: [], image: null, preview: null })
        }
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setDetailInput('')
        setFormData({ name: '', details: [], image: null, preview: null })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData({
                ...formData,
                image: file,
                preview: URL.createObjectURL(file)
            })
        }
    }

    const addDetail = () => {
        if (detailInput.trim()) {
            setFormData({
                ...formData,
                details: [...formData.details, detailInput.trim()]
            })
            setDetailInput('')
        }
    }

    const removeDetail = (index) => {
        const newDetails = [...formData.details]
        newDetails.splice(index, 1)
        setFormData({ ...formData, details: newDetails })
    }

    const handleSubmit = async () => {
        if (!formData.name) {
            toast.error('Name is required')
            return
        }
        if (formData.details.length === 0) {
            toast.error('At least one detail field is required')
            return
        }
        if (!editId && !formData.image) {
             toast.error('Image is required')
             return
        }

        setIsSubmitLoading(true)
        
        const data = new FormData()
        data.append('name', formData.name)
        data.append('details', JSON.stringify(formData.details))
        if(formData.image) {
            data.append('image', formData.image)
        }

        let res
        if (editId) {
            res = await updateWithdrawMethod(editId, data)
        } else {
            res = await createWithdrawMethod(data)
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
            const res = await deleteWithdrawMethod(id)
            if (res && res.status === true) {
                toast.success('Deleted successfully')
                fetchData()
            } else {
                toast.error(res.message || 'Delete failed')
            }
        }
    }

    const handleSwitchToggle = async (id) => {
        const res = await toggleWithdrawMethod(id)
        if (res && res.status === true) {
            toast.success('Status updated')
            fetchData() 
        } else {
            toast.error('Update failed')
        }
    }

    return (
        <Card>
            <CardHeader title='Withdraw Setting' />
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
                            <th>IMAGE</th>
                            <th>NAME</th>
                            <th>DETAILS</th>
                            <th>CREATED DATE</th>
                            <th>EDIT</th>
                            <th>IS ACTIVE</th>
                            <th>DELETE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className='text-center'>
                                    <Typography>Loading...</Typography>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={8} className='text-center'>
                                    <Typography>No withdrawal methods found.</Typography>
                                </td>
                            </tr>
                        ) : (
                            data
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((item, index) => (
                                <tr key={item._id}>
                                    <td>{(page * rowsPerPage) + index + 1}</td>
                                    <td>
                                        <div className='h-12 w-12 flex items-center justify-center bg-gray-100 rounded overflow-hidden'>
                                            <img src={getImageUrl(item.image)} alt={item.name} className='h-full w-full object-contain' />
                                        </div>
                                    </td>
                                    <td>
                                        <Typography color='text.primary'>{item.name}</Typography>
                                    </td>
                                    <td>
                                        <div className='flex flex-col gap-1'>
                                            {item.details && Array.isArray(item.details) && item.details.map((det, idx) => (
                                                <div key={idx} className='flex items-center gap-2'>
                                                    <div className='w-2 h-2 rounded-full bg-primary mb-0.5' />
                                                    <Typography variant='body2'>{det}</Typography>
                                                </div>
                                            ))}
                                        </div>
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
                                        <Switch 
                                            checked={item.isEnabled} 
                                            onChange={() => handleSwitchToggle(item._id)} 
                                        />
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
                <DialogTitle>{editId ? 'Edit Method' : 'Add Method'}</DialogTitle>
                <DialogContent className='flex flex-col gap-6 pt-6'>
                     <div className='flex flex-col gap-2 items-center mb-2'>
                        {formData.preview && (
                            <img src={formData.preview} alt="Preview" className="w-20 h-20 object-contain border rounded" />
                        )}
                        <Button variant='tonal' component='label'>
                            Upload Icon
                            <input type='file' hidden accept='image/*' onChange={handleImageChange} />
                        </Button>
                     </div>
                     <CustomTextField 
                        label='Method Name'
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        fullWidth
                     />
                     
                     <div className='flex flex-col gap-2'>
                        <Typography variant='body2'>Input Fields (e.g. Account No, IFSC)</Typography>
                        <div className='flex gap-2'>
                            <CustomTextField 
                                placeholder='Field Name' 
                                value={detailInput}
                                onChange={e => setDetailInput(e.target.value)}
                                fullWidth
                                onKeyPress={(e) => { if(e.key === 'Enter') addDetail() }}
                            />
                            <Button variant='contained' onClick={addDetail}>Add</Button>
                        </div>
                        <div className='flex flex-wrap gap-2 mt-2'>
                            {formData.details.map((detail, index) => (
                                <div key={index} className='flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full gap-2'>
                                    <Typography variant='caption'>{detail}</Typography>
                                    <i 
                                        className='tabler-x text-xs cursor-pointer hover:text-error' 
                                        onClick={() => removeDetail(index)}
                                    />
                                </div>
                            ))}
                        </div>
                     </div>

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

export default WithdrawSetting
