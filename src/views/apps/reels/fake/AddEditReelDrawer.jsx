
'use client'

import { useState, useEffect } from 'react'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Styles from '@core/styles/table.module.css'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'

import CustomTextField from '@core/components/mui/TextField'
import { getRealSeller } from '@/services/sellerService'
import { getProductsBySeller } from '@/services/productService'
import { createReel, updateReel } from '@/services/reelService'
import { getImageUrl } from '@/utils/imageUrl'

const AddEditReelDrawer = ({ open, handleClose, fetchData, editData }) => {
  const [sellerList, setSellerList] = useState([])
  const [productList, setProductList] = useState([])
  const [formData, setFormData] = useState({
    sellerId: '',
    productId: '',
    videoType: 'file', // or 'link'
    video: null, // File object or URL string
    videoPreview: '',
    thumbnailType: 'file',
    thumbnail: null,
    thumbnailPreview: ''
  })

  useEffect(() => {
    if (open) {
      loadSellers()
      if (editData) {
         // Populate form for edit
         setFormData({
            sellerId: editData.sellerId?._id || '',
            productId: editData.productId?.[0]?._id || '', 
            videoType: editData.videoType === 1 ? 'file' : 'link', 
            video: editData.video,
            videoPreview: getImageUrl(editData.video),
            thumbnailType: editData.thumbnailType === 1 ? 'file' : 'link',
            thumbnail: editData.thumbnail,
            thumbnailPreview: getImageUrl(editData.thumbnail)
         })
         if (editData.sellerId?._id) {
             loadProducts(editData.sellerId._id)
         }
      } else {
        // Reset form
        setFormData({
            sellerId: '',
            productId: '',
            videoType: 'file',
            video: null,
            videoPreview: '',
            thumbnailType: 'file',
            thumbnail: null,
            thumbnailPreview: ''
        })
        setProductList([])
      }
    }
  }, [open, editData])

  const loadSellers = async () => {
    const res = await getRealSeller()
    if (res?.status && res?.sellers) {
      setSellerList(res.sellers)
    }
  }

  const loadProducts = async (sellerId) => {
    const res = await getProductsBySeller(sellerId)
    if (res?.status && res?.products) {
      setProductList(res.products)
    }
  }

  const handleSellerChange = (e) => {
    const sellerId = e.target.value
    setFormData(prev => ({ ...prev, sellerId, productId: '' }))
    loadProducts(sellerId)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ 
          ...prev, 
          video: file,
          videoPreview: URL.createObjectURL(file) 
      }))
    }
  }

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ 
          ...prev, 
          thumbnail: file,
          thumbnailPreview: URL.createObjectURL(file) 
      }))
    }
  }

  const handleSubmit = async () => {
    try {
        const form = new FormData()
        form.append('sellerId', formData.sellerId)
        // For Create: productIds (JSON array)
        if (!editData) {
            form.append('productIds', JSON.stringify([formData.productId]))
        } else {
            // For Update: productId (String)
            form.append('productId', formData.productId)
        } 
        
        form.append('videoType', formData.videoType === 'file' ? 1 : 2) // 1=File, 2=Link
        form.append('thumbnailType', formData.thumbnailType === 'file' ? 1 : 2) // 1=File, 2=Link
        
        if (formData.videoType === 'file' && formData.video instanceof File) {
            form.append('video', formData.video)
        } else if (formData.videoType === 'link') {
            form.append('video', formData.video)
        }

        if (formData.thumbnailType === 'file' && formData.thumbnail instanceof File) {
            form.append('thumbnail', formData.thumbnail)
        } else if (formData.thumbnailType === 'link') {
            form.append('thumbnail', formData.thumbnail)
        }

        // Debug FormData
        for (var pair of form.entries()) {
            console.log(pair[0]+ ', ' + pair[1]); 
        }

        let res
        if (editData) {
            // Use editData.sellerId._id for the query param (current owner)
            // Handle case where sellerId might be populated object or just ID string
            const originalSellerId = editData.sellerId?._id || editData.sellerId
            res = await updateReel(form, editData._id, originalSellerId)
        } else {
            res = await createReel(form)
        }

        if (res?.status) {
            handleClose()
            fetchData()
        } else {
            alert(res?.message || 'Operation failed')
        }
    } catch (error) {
        console.error("HandleSubmit Error:", error)
        alert("An error occurred while saving.")
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-5 border-b'>
        <Typography variant='h6'>{editData ? 'Edit Reel' : 'Fake Reel'}</Typography>
        <IconButton onClick={handleClose}>
          <i className='tabler-x' />
        </IconButton>
      </div>

      <Box className='p-5 flex flex-col gap-5'>
        <CustomTextField
          select
          fullWidth
          label='Seller'
          value={formData.sellerId}
          onChange={handleSellerChange}
        >
            <MenuItem value=''>Select Seller</MenuItem>
            {sellerList.map(seller => (
                <MenuItem key={seller._id} value={seller._id}>
                    {seller.firstName} {seller.lastName}
                </MenuItem>
            ))}
        </CustomTextField>

        <CustomTextField
          select
          fullWidth
          label='Product'
          value={formData.productId}
          onChange={e => setFormData({ ...formData, productId: e.target.value })}
          disabled={!formData.sellerId}
        >
            <MenuItem value=''>Select Product</MenuItem>
             {productList.map(product => (
                <MenuItem key={product._id} value={product._id}>
                    {product.productName}
                </MenuItem>
            ))}
        </CustomTextField>

        <FormControl>
            <FormLabel>Video Type :-</FormLabel>
            <RadioGroup
                row
                value={formData.videoType}
                onChange={e => setFormData({ ...formData, videoType: e.target.value })}
            >
                <FormControlLabel value="file" control={<Radio />} label="File" />
                <FormControlLabel value="link" control={<Radio />} label="Link" />
            </RadioGroup>
        </FormControl>

        <div>
            <FormLabel className='mb-2 block'>Video</FormLabel>
             {formData.videoType === 'file' ? (
                 <div className="flex flex-col gap-2">
                     <div className='flex gap-2'>
                        <Button component='label' variant='contained' htmlFor='video-upload'>
                            Choose File
                            <input
                                hidden
                                type='file'
                                accept='video/*'
                                onChange={handleFileChange}
                                id='video-upload'
                            />
                        </Button>
                        <CustomTextField 
                            fullWidth 
                            value={formData.video instanceof File ? formData.video.name : 'No file chosen'} 
                            disabled 
                        />
                     </div>
                 </div>
             ) : (
                 <CustomTextField 
                    fullWidth 
                    placeholder="Video Link" 
                    value={(formData.video instanceof File || formData.video === null) ? '' : formData.video}
                    onChange={e => setFormData({ ...formData, video: e.target.value })}
                 />
             )}
             
             {formData.videoPreview && (
                 <div className="mt-4 flex gap-4">
                     <video src={formData.videoPreview} controls className="w-1/2 rounded bg-black" />
                 </div>
             )}
        </div>

        <FormControl>
            <FormLabel>Thumbnail Type :-</FormLabel>
            <RadioGroup
                row
                value={formData.thumbnailType}
                onChange={e => setFormData({ ...formData, thumbnailType: e.target.value })}
            >
                <FormControlLabel value="file" control={<Radio />} label="File" />
                <FormControlLabel value="link" control={<Radio />} label="Link" />
            </RadioGroup>
        </FormControl>

        <div>
            <FormLabel className='mb-2 block'>Thumbnail</FormLabel>
             {formData.thumbnailType === 'file' ? (
                 <div className="flex flex-col gap-2">
                     <div className='flex gap-2'>
                        <Button component='label' variant='contained' htmlFor='thumbnail-upload'>
                            Choose File
                            <input
                                hidden
                                type='file'
                                accept='image/*'
                                onChange={handleThumbnailFileChange}
                                id='thumbnail-upload'
                            />
                        </Button>
                        <CustomTextField 
                            fullWidth 
                            value={formData.thumbnail instanceof File ? formData.thumbnail.name : 'No file chosen'} 
                            disabled 
                        />
                     </div>
                 </div>
             ) : (
                 <CustomTextField 
                    fullWidth 
                    placeholder="Thumbnail Link" 
                    value={(formData.thumbnail instanceof File || formData.thumbnail === null) ? '' : formData.thumbnail}
                    onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                 />
             )}
             
             {formData.thumbnailPreview && (
                 <div className="mt-4 flex gap-4">
                     <img src={formData.thumbnailPreview} alt="Thumbnail Preview" className="w-[100px] h-[100px] object-cover rounded bg-gray-100" />
                 </div>
             )}
        </div>

        <div className='flex gap-4 justify-end mt-4'>
             <Button variant='contained' onClick={handleSubmit}>
                {editData ? 'Update' : 'Submit'}
             </Button>
             <Button variant='outlined' color='secondary' onClick={handleClose}>
                Close
             </Button>
        </div>
      </Box>
    </Drawer>
  )
}

export default AddEditReelDrawer
