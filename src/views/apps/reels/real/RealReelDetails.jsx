
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'

import ProductVideoDialog from '../fake/ProductVideoDialog' // Reuse ProductVideoDialog from fake folder or move to common
import { detailsOfReel } from '@/services/reelService'
import { getImageUrl } from '@/utils/imageUrl'

const RealReelDetails = () => {
  const { id } = useParams()
  const router = useRouter()
  const [reelData, setReelData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const [productVideoOpen, setProductVideoOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    if (id) {
       fetchDetails(id)
    }
  }, [id])

  const fetchDetails = async (reelId) => {
      setIsLoading(true)
      try {
          const res = await detailsOfReel(reelId)
          if (res?.status && res?.reel) {
             setReelData(res.reel)
          } else {
             setReelData(null)
          }
      } catch (error) {
          console.error(error)
      } finally {
          setIsLoading(false)
      }
  }

  const handleProductInfoClick = (product) => {
    setSelectedProduct(product)
    setProductVideoOpen(true)
  }

  if (isLoading) return <Typography>Loading...</Typography>
  if (!reelData) return <Typography>Reel not found</Typography>

  const products = reelData?.productId || []
  const productList = Array.isArray(products) ? products : (products ? [products] : [])

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
            <Typography variant="h4">Reel Details</Typography>
            <Button variant="outlined" onClick={() => router.back()}>Back</Button>
        </div>

        <Card>
            <CardHeader title="Products in Reel" />
            <CardContent>
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
                                            <img src={getImageUrl(product.mainImage)} alt={product.productName} className="w-full h-full object-cover" />
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
            </CardContent>
        </Card>
      </div>

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

export default RealReelDetails
