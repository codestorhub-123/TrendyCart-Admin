
'use client'

import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

import ProductVideoDialog from './ProductVideoDialog'

const ReelProductsDialog = ({ open, handleClose, reelData }) => {
  const [productVideoOpen, setProductVideoOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const handleProductInfoClick = (product) => {
    setSelectedProduct(product)
    setProductVideoOpen(true)
  }

  const products = reelData?.productId || []
  // Handle case where productId might be a single object instead of array (just in case)
  const productList = Array.isArray(products) ? products : (products ? [products] : [])

  return (
    <>
        <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth='lg'
        >
        <DialogTitle className='flex justify-between items-center'>
            Reels
            <IconButton onClick={handleClose}>
            <i className='tabler-x' />
            </IconButton>
        </DialogTitle>
        <DialogContent>
            <TableContainer component={Paper} elevation={0} className='border'>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                    <TableRow>
                        <TableCell>NO</TableCell>
                        <TableCell>IMAGE</TableCell>
                        <TableCell>PRODUCT</TableCell>
                        <TableCell>PRODUCT CODE</TableCell>
                        <TableCell>PRICE</TableCell>
                        <TableCell>SHIPPING CHARGES</TableCell>
                        <TableCell>INFO</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {productList.length > 0 ? (
                        productList.map((product, index) => (
                            <TableRow
                            key={product._id || index}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                            <TableCell component="th" scope="row">
                                {index + 1}
                            </TableCell>
                            <TableCell>
                                <div className="w-[34px] h-[34px] rounded overflow-hidden">
                                     {product.mainImage ? (
                                         <img src={product.mainImage} alt={product.productName} className="w-full h-full object-cover" />
                                     ) : (
                                         <div className="w-full h-full bg-gray-200" />
                                     )}
                                </div>
                            </TableCell>
                            <TableCell>{product.productName}</TableCell>
                            <TableCell>{product.productCode}</TableCell>
                            <TableCell>{product.price}</TableCell>
                            <TableCell>{product.shippingCharges}</TableCell>
                            <TableCell>
                                <IconButton onClick={() => handleProductInfoClick(product)}>
                                    <i className='tabler-info-circle text-textSecondary' />
                                </IconButton>
                            </TableCell>
                            </TableRow>
                        ))
                    ) : ( 
                        <TableRow>
                            <TableCell colSpan={7} align="center">No Products Found</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </TableContainer>
        </DialogContent>
        </Dialog>

        {selectedProduct && (
            <ProductVideoDialog 
                open={productVideoOpen} 
                handleClose={() => setProductVideoOpen(false)}
                productData={selectedProduct}
                videoUrl={reelData?.video}
            />
        )}
    </>
  )
}

export default ReelProductsDialog
