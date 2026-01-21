'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useSelector } from 'react-redux'

import { getProductDetailsForAdmin } from '@/services/productService'

const ProductDetail = ({ productId }) => {
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { currency } = useSelector(state => state.settingsReducer)

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true)
      const res = await getProductDetailsForAdmin(productId)
      console.log('Product details:', res)
      if (res && res.status === true) {
        setProduct(res.product || res.data)
      }
      setIsLoading(false)
    }

    if (productId) {
      fetchProductDetails()
    }
  }, [productId])

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
          <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (!product) {
    return (
      <Box sx={{ p: 4 }}>
          <Typography>Product not found</Typography>
      </Box>
    )
  }

  const saleTypeMap = {
    0: 'Buy Now',
    1: 'Auction',
    2: 'Both'
  }

  return (
    <div>
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4'>Product Detail</Typography>
        <Button variant='contained' onClick={() => router.back()} startIcon={<i className='tabler-arrow-left' />}>
          Back
        </Button>
      </Box>

      <Grid container spacing={6}>
        {/* Left Side - Images */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              {/* Seller Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                    src={product.seller?.image} 
                    alt={product.seller?.firstName}
                    sx={{ width: 60, height: 60, mr: 2 }}
                  />
                <div>
                  <Typography variant='body2' color='text.secondary'>Seller</Typography>
                  <Typography variant='body1' fontWeight='medium'>
                    {product.seller?.firstName} {product.seller?.lastName}
                  </Typography>
                </div>
              </Box>

              {/* Main Image */}
              <Box sx={{ mb: 2 }}>
                <img 
                  src={product.mainImage} 
                  alt={product.productName}
                  style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                />
              </Box>

              {/* Additional Images */}
              {product.images && product.images.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {product.images.map((img, index) => (
                    <img 
                      key={index}
                      src={img} 
                      alt={`Product ${index + 1}`}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side - Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Product Name */}
              <Typography variant='h5' sx={{ mb: 2, textTransform: 'uppercase' }}>
                {product.productName}
              </Typography>

              {/* Basic Info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={4}>
                  <Typography variant='body2' color='text.secondary'>Product Code:</Typography>
                  <Typography variant='body1' fontWeight='medium'>{product.productCode}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant='body2' color='text.secondary'>Seller:</Typography>
                  <Typography variant='body1' fontWeight='medium'>
                    {product.seller?.businessTag || 'Developer'}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant='body2' color='text.secondary'>Category:</Typography>
                  <Typography variant='body1' fontWeight='medium'>{product.category?.name}</Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant='body2' color='text.secondary'>Status:</Typography>
                  <Chip 
                    label={product.isOutOfStock ? 'Out of Stock' : 'In Stock'} 
                    color={product.isOutOfStock ? 'error' : 'success'}
                    size='small'
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Price Info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ bgcolor: 'success.lighter', p: 2, borderRadius: 2, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <i className='tabler-coin' style={{ fontSize: '24px', color: 'green' }} />
                    </Box>
                    <Typography variant='body2' color='text.secondary'>Price</Typography>
                    <Typography variant='h6' fontWeight='bold'>{currency}{product.price}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ bgcolor: 'info.lighter', p: 2, borderRadius: 2, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <i className='tabler-truck-delivery' style={{ fontSize: '24px', color: 'blue' }} />
                    </Box>
                    <Typography variant='body2' color='text.secondary'>Shipping</Typography>
                    <Typography variant='h6' fontWeight='bold'>{currency}{product.shippingCharges}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ bgcolor: 'warning.lighter', p: 2, borderRadius: 2, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <i className='tabler-shopping-cart' style={{ fontSize: '24px', color: 'orange' }} />
                    </Box>
                    <Typography variant='body2' color='text.secondary'>Sold</Typography>
                    <Typography variant='h6' fontWeight='bold'>{product.sold || 0}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ bgcolor: 'error.lighter', p: 2, borderRadius: 2, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <i className='tabler-tag' style={{ fontSize: '24px', color: 'red' }} />
                    </Box>
                    <Typography variant='body2' color='text.secondary'>Tag</Typography>
                    <Typography variant='h6' fontWeight='bold'>{product.seller?.businessTag || 'Shop'}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Box sx={{ mb: 3 }}>
                <Typography variant='h6' sx={{ mb: 1 }}>Description</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {product.description}
                </Typography>
              </Box>

              {/* Attributes */}
              {product.attributes && product.attributes.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant='h6' sx={{ mb: 1 }}>Attributes</Typography>
                  {product.attributes.map((attr, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant='body2' fontWeight='medium'>{attr.key}:</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {Array.isArray(attr.values) ? attr.values.join(', ') : attr.values}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Sale Information */}
              <Box>
                <Typography variant='h6' sx={{ mb: 1 }}>Sale Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant='body2' color='text.secondary'>Sale Type</Typography>
                      <Typography variant='body1' fontWeight='medium'>
                        <i className='tabler-shopping-bag' /> {saleTypeMap[product.productSaleType] || 'Buy Now'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant='body2' color='text.secondary'>Min. Offer Price ({currency})</Typography>
                      <Typography variant='body1' fontWeight='medium'>{product.minimumOfferPrice || 0}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Customer Reviews */}
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant='h6'>Customer Reviews</Typography>
                  <Chip label={`${product.review || 0} Reviews`} color='primary' size='small' />
                </Box>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <i className='tabler-message-circle' style={{ fontSize: '48px', color: '#ccc' }} />
                  <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                    No reviews yet
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}

export default ProductDetail
