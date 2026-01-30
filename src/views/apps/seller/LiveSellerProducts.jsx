'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import { useSelector } from 'react-redux'
import { getLiveSellerList } from '@/services/liveSellerService'
import { getImageUrl } from '@/utils/imageUrl'

const LiveSellerProducts = () => {
  const router = useRouter()
  const params = useParams()
  const { lang: locale, id } = params
  const [seller, setSeller] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { currency } = useSelector(state => state.settingsReducer)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      // Since we don't have a single seller API, we fetch the list
      // In a real scenario, you'd have an API like getLiveSellerById(id)
      const res = await getLiveSellerList(1, 100)
      if (res && res.status === true) {
        const foundSeller = res.liveSeller.find(s => s._id === id)
        setSeller(foundSeller)
      }
      setIsLoading(false)
    }

    fetchData()
  }, [id])

  const handleBack = () => {
    router.push(`/${locale}/apps/seller/live`)
  }

  if (isLoading) return <Typography className='p-6'>Loading...</Typography>
  if (!seller) return <Typography className='p-6'>Seller not found</Typography>

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-4'>
        <IconButton onClick={handleBack}>
          <i className='tabler-arrow-left' />
        </IconButton>
        <Typography variant='h4' sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          Products for {seller.firstName} {seller.lastName}
          {seller.isLive && (
            <Chip 
              label='Live' 
              color='error' 
              size='small' 
              sx={{ fontWeight: 'bold' }} 
            />
          )}
        </Typography>
      </div>

      <Grid container spacing={6}>
        {seller.selectedProducts && seller.selectedProducts.length > 0 ? (
          seller.selectedProducts.map((product, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div className='relative pt-[100%]'>
                  <img
                    src={getImageUrl(product.mainImage)}
                    alt={product.productName}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  {seller.isLive && (
                    <Chip
                      label='Live'
                      color='error'
                      size='small'
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        fontWeight: 'bold',
                        zIndex: 1
                      }}
                    />
                  )}
                </div>
                <div className='p-5 flex flex-col flex-grow gap-2'>
                  <Typography variant='h5' className='font-medium line-clamp-2'>
                    {product.productName}
                  </Typography>
                  <div className='flex items-center gap-2'>
                    <Typography variant='h6' color='primary'>
                      {currency}{product.price}
                    </Typography>
                    {product.minimumBidPrice && (
                      <Typography variant='body2' color='text.secondary'>
                        Min Bid: {currency}{product.minimumBidPrice}
                      </Typography>
                    )}
                  </div>
                  {product.productAttributes && product.productAttributes.length > 0 && (
                    <div className='flex flex-wrap gap-1 mt-auto'>
                      {product.productAttributes[0].values.map((val, i) => (
                        <Chip key={i} label={val} size='small' variant='tonal' />
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card className='p-6 text-center text-textSecondary'>
              No products found for this seller.
            </Card>
          </Grid>
        )}
      </Grid>
    </div>
  )
}

export default LiveSellerProducts
