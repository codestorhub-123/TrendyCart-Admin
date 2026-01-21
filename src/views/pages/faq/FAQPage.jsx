'use client'

import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CustomTextField from '@core/components/mui/TextField'
import { toast } from 'react-hot-toast'

import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from '@/services/faqService'

const dummyData = [
    {
        _id: '1',
        question: 'abcdserbtryry',
        answer: 'string'
    },
    {
        _id: '2',
        question: 'abcdserbtryry',
        answer: 'string'
    },
    {
        _id: '3',
        question: 'abcdserbtryry',
        answer: 'string'
    }
]

const FAQPage = () => {
    const [faqs, setFaqs] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)
    const [editingFaq, setEditingFaq] = useState(null)
    const [formData, setFormData] = useState({ question: '', answer: '' })
    const [actionLoading, setActionLoading] = useState(false)
    const [expanded, setExpanded] = useState(false)

    const fetchData = async () => {
        setIsLoading(true)
        const res = await getFAQs()
        if (res && res.status === true) {
            setFaqs(res.FaQ || [])
        } else {
             setFaqs([])
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false)
    }

    const handleOpenDialog = (faq = null) => {
        if (faq) {
            setEditingFaq(faq)
            setFormData({ question: faq.question, answer: faq.answer })
        } else {
            setEditingFaq(null)
            setFormData({ question: '', answer: '' })
        }
        setOpenDialog(true)
    }

    const handleCloseDialog = () => {
        setOpenDialog(false)
        setEditingFaq(null)
        setFormData({ question: '', answer: '' })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setActionLoading(true)
        try {
            if (editingFaq) {
                const res = await updateFAQ(editingFaq._id, formData)
                if (res && res.status === true) {
                    toast.success(res.message || 'FAQ updated successfully')
                    fetchData()
                    handleCloseDialog()
                } else {
                    toast.error(res.message || 'Failed to update FAQ')
                }
            } else {
                const res = await createFAQ(formData)
                if (res && res.status === true) {
                    toast.success(res.message || 'FAQ created successfully')
                    fetchData()
                    handleCloseDialog()
                } else {
                    toast.error(res.message || 'Failed to create FAQ')
                }
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this FAQ?')) {
            try {
                const res = await deleteFAQ(id)
                if (res && res.status === true) {
                    toast.success(res.message || 'FAQ deleted successfully')
                    fetchData()
                } else {
                    toast.error(res.message || 'Failed to delete FAQ')
                }
            } catch (error) {
                toast.error('An error occurred')
            }
        }
    }

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-col items-center justify-center text-center gap-2'>
                <Typography variant='h4' className='font-bold'>
                    Frequently Asked <span className='text-primary'>Questions</span>
                </Typography>
                <Typography variant='body1' color='text.secondary'>
                    Need help or have questions? Find your answers below.
                </Typography>
            </div>

            <div className='flex justify-center'>
                <Button 
                    variant='contained' 
                    color='primary' 
                    startIcon={<i className='tabler-plus' />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Question
                </Button>
            </div>

            <div className='flex flex-col gap-4 max-w-4xl mx-auto w-full'>
                {isLoading ? (
                    <Typography className='text-center'>Loading...</Typography>
                ) : faqs.length === 0 ? (
                    <Typography className='text-center'>No FAQs found</Typography>
                ) : (
                    faqs.map((faq, index) => (
                        <Accordion 
                            key={faq._id} 
                            expanded={expanded === faq._id} 
                            onChange={handleChange(faq._id)}
                            className='mb-4 border rounded-[6px] !shadow-none'
                            sx={{
                                '&:before': { display: 'none' },
                                '&.Mui-expanded': {
                                    margin: '0 0 1rem 0',
                                    border: 'none'
                                }
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<i className={`tabler-chevron-down ${expanded === faq._id ? 'text-white' : ''}`} />}
                                aria-controls={`panel${index}-content`}
                                id={`panel${index}-header`}
                                sx={{
                                    borderRadius: '6px',
                                    '&.Mui-expanded': {
                                        backgroundColor: 'var(--mui-palette-primary-main)',
                                        color: 'var(--mui-palette-common-white)',
                                        borderBottomLeftRadius: 0,
                                        borderBottomRightRadius: 0,
                                        '& .MuiAccordionSummary-expandIconWrapper': {
                                            color: 'var(--mui-palette-common-white)'
                                        }
                                    }
                                }}
                            >
                                <Typography className='font-medium' color={expanded === faq._id ? 'inherit' : 'text.primary'}>{faq.question}</Typography>
                            </AccordionSummary>
                            <AccordionDetails className='p-5 border border-t-0 rounded-b-[6px] dark:bg-background-paper'>
                                <Typography color='text.secondary' className='mb-4'>
                                    {faq.answer}
                                </Typography>
                                <div className='flex justify-end gap-2'>
                                    <Button 
                                        variant='outlined' 
                                        color='secondary' 
                                        size='small' 
                                        startIcon={<i className='tabler-edit' />}
                                        onClick={() => handleOpenDialog(faq)}
                                    >
                                        Edit
                                    </Button>
                                    <Button 
                                        variant='contained' 
                                        color='error' 
                                        size='small' 
                                        startIcon={<i className='tabler-trash' />}
                                        onClick={() => handleDelete(faq._id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}
            </div>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='sm' fullWidth onClick={e => e.stopPropagation()}>
                <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <div className='flex flex-col gap-4'>
                            <CustomTextField
                                fullWidth
                                label='Question'
                                placeholder='Enter question...'
                                value={formData.question}
                                onChange={e => setFormData({ ...formData, question: e.target.value })}
                                required
                            />
                            <CustomTextField
                                fullWidth
                                multiline
                                rows={4}
                                label='Answer'
                                placeholder='Enter answer...'
                                value={formData.answer}
                                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                required
                            />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button variant='tonal' color='secondary' onClick={handleCloseDialog}>Cancel</Button>
                        <Button variant='contained' type='submit' disabled={actionLoading}>
                            {actionLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    )
}

export default FAQPage
