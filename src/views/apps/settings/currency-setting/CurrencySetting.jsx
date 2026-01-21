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
import CustomTextField from '@core/components/mui/TextField'
import { Switch } from '@mui/material'
import { toast } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { setCurrency } from '@/redux-store/slices/settings'

// Table Imports
import Pagination from '@mui/material/Pagination'

import tableStyles from '@core/styles/table.module.css'

import { 
    createCurrency, 
    updateCurrency, 
    deleteCurrency, 
    setDefaultCurrency, 
    fetchCurrencies 
} from '@/services/currencyService'

const CurrencySetting = () => {
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editId, setEditId] = useState(null)
    const [formData, setFormData] = useState({ 
        name: '', 
        symbol: '', 
        currencyCode: '',
        countryCode: ''
    })
    const [isSubmitLoading, setIsSubmitLoading] = useState(false)
    const dispatch = useDispatch()
    
    // Pagination
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const fetchData = async () => {
        setIsLoading(true)
        const res = await fetchCurrencies()
        if (res && res.status === true) {
            // Adjust based on your actual API response key (likely res.currency or res.data)
            setData(res.currency || res.data || [])
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
                symbol: item.symbol,
                currencyCode: item.currencyCode,
                countryCode: item.countryCode
            })
        } else {
            setEditId(null)
            setFormData({ 
                name: '', 
                symbol: '', 
                currencyCode: '',
                countryCode: ''
            })
        }
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setFormData({ name: '', symbol: '', currencyCode: '', countryCode: '' })
    }

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.symbol || !formData.currencyCode) {
            toast.error('Name, Symbol and Currency Code are required')
            return
        }
        setIsSubmitLoading(true)
        
        let res
        if (editId) {
            res = await updateCurrency(editId, formData)
        } else {
            res = await createCurrency(formData)
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
            const res = await deleteCurrency(id)
            if (res && res.status === true) {
                toast.success('Deleted successfully')
                fetchData()
            } else {
                toast.error(res.message || 'Delete failed')
            }
        }
    }

    const handleDefaultToggle = async (id) => {
        const res = await setDefaultCurrency(id)
        if (res && res.status === true) {
            toast.success('Default currency updated')
            
            // Update Redux State immediately
            const updatedItem = data.find(item => item._id === id)
            if (updatedItem) {
                dispatch(setCurrency(updatedItem.symbol))
            }
            
            fetchData() 
        } else {
            toast.error('Update failed')
        }
    }

    return (
        <Card>
            <CardHeader title='Currency Setting' />
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
                            <th>NAME</th>
                            <th>SYMBOL</th>
                            <th>CURRENCY CODE</th>
                            <th>COUNTRY CODE</th>
                            <th>IS DEFAULT</th>
                            <th>CREATED DATE</th>
                            <th>ACTION</th>
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
                                    <Typography>No currencies found.</Typography>
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
                                        <Typography color='text.primary'>{item.symbol}</Typography>
                                    </td>
                                    <td>
                                        <Typography color='text.primary'>{item.currencyCode}</Typography>
                                    </td>
                                    <td>
                                        <Typography color='text.primary'>{item.countryCode}</Typography>
                                    </td>
                                    <td>
                                        <Switch 
                                            checked={item.isDefault || false}
                                            onChange={() => handleDefaultToggle(item._id)}
                                        />
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
                                        <div className='flex gap-2'>
                                            <IconButton onClick={() => handleOpen(item)}>
                                                <i className='tabler-edit text-textSecondary' />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(item._id)} color='error'>
                                                <i className='tabler-trash' />
                                            </IconButton>
                                        </div>
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
                <DialogTitle>{editId ? 'Edit Currency' : 'Add Currency'}</DialogTitle>
                <DialogContent className='flex flex-col gap-6 pt-6'>
                     <CustomTextField 
                        label='Name'
                        value={formData.name}
                        onChange={e => handleChange('name', e.target.value)}
                        fullWidth
                        placeholder='e.g. Indian Rupee'
                     />
                     <CustomTextField 
                        label='Symbol'
                        value={formData.symbol}
                        onChange={e => handleChange('symbol', e.target.value)}
                        fullWidth
                        placeholder='e.g. $, ₹'
                     />
                     <CustomTextField 
                        label='Currency Code'
                        value={formData.currencyCode}
                        onChange={e => handleChange('currencyCode', e.target.value)}
                        fullWidth
                        placeholder='e.g. INR'
                     />
                     <CustomTextField 
                        label='Country Code'
                        value={formData.countryCode}
                        onChange={e => handleChange('countryCode', e.target.value)}
                        fullWidth
                        placeholder='e.g. 91'
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

export default CurrencySetting
