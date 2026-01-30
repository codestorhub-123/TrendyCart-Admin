
'use client'

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { getImageUrl } from '@/utils/imageUrl'

const ProductVideoDialog = ({ open, handleClose, productData, videoUrl }) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='md'
    >
      <DialogTitle className='flex justify-between items-center'>
        Product Information
        <IconButton onClick={handleClose}>
          <i className='tabler-x' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div className='flex gap-5'>
            <div className='w-1/2'>
                 {videoUrl ? (
                     <video src={getImageUrl(videoUrl)} controls className='w-full rounded bg-black aspect-[9/16]' />
                 ) : (
                     <div className='w-full h-64 bg-gray-200 flex items-center justify-center rounded'>
                         No Video
                     </div>
                 )}
            </div>
            <div className='w-1/2'>
                <Typography variant='h6' className='mb-2'>
                    {productData?.productName || 'Product Name'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {productData?.productCode ? `Code: ${productData.productCode}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary" className='mt-2'>
                    {productData?.description || ''}
                </Typography>
                 {productData?.seller && (
                     <Typography variant="subtitle2" className='mt-4'>
                         Seller: {
                           typeof productData.seller === 'object' 
                             ? (productData.seller.businessName || `${productData.seller.firstName || ''} ${productData.seller.lastName || ''}`.trim() || '-')
                             : productData.seller
                         } 
                     </Typography>
                 )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProductVideoDialog
