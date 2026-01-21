'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import Link from 'next/link'
import CustomAvatar from '@core/components/mui/Avatar'
import { getProfileByAdmin } from '@/services/sellerService'
import { getInitials } from '@/utils/getInitials'

const SellerDetail = () => {
  const { id, lang } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSellerData = async () => {
      if (!id) return
      setLoading(true)
      try {
        const res = await getProfileByAdmin(id)
        if (res && res.status) {
          setData(res.seller)
        }
      } catch (error) {
        console.error('Failed to fetch seller details', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSellerData()
  }, [id])

  if (loading) {
    return (
      <div className='flex justify-center items-center h-full'>
        <CircularProgress />
      </div>
    )
  }

  if (!data) {
    return (
      <div className='flex flex-col gap-4 items-center justify-center h-full'>
        <Typography variant='h5'>Seller not found</Typography>
        <Button component={Link} href={`/${lang}/apps/seller/real`} variant='contained'>
          Back to List
        </Button>
      </div>
    )
  }

  const {
    firstName,
    lastName,
    email,
    mobileNumber,
    image,
    businessName,
    businessTag,
    address = {},
    bankDetails = {}
  } = data

  const fullName = `${firstName || ''} ${lastName || ''}`.trim()

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <div className='flex justify-between items-center'>
          <Typography variant='h4'>Seller Details</Typography>
          <Button component={Link} href={`/${lang}/apps/seller/real`} variant='tonal' color='secondary' startIcon={<i className='tabler-arrow-left' />}>
            Back
          </Button>
        </div>
      </Grid>
      
      {/* User Left Side - Profile Card */}
      <Grid item xs={12} md={5} lg={4}>
        <Card>
          <CardContent className='flex flex-col items-center gap-4'>
            <CustomAvatar
              src={image || undefined}
              alt={fullName}
              variant='rounded'
              skin='light'
              color='primary'
              sx={{ width: 120, height: 120, fontSize: '3rem' }}
            >
              {getInitials(fullName)}
            </CustomAvatar>
            <div className='flex flex-col items-center'>
              <Typography variant='h5'>{fullName || 'No Name'}</Typography>
              <Typography color='text.secondary'>{email || '-'}</Typography>
            </div>
            
            <div className='flex gap-2 w-full justify-center'>
               <div className='flex flex-col items-center p-3 rounded bg-action-hover min-w-[100px]'>
                  <i className='tabler-shopping-cart mb-1' />
                  <Typography variant='body2'>Orders</Typography>
                  <Typography variant='h6'>{data.totalOrder || 0}</Typography>
               </div>
               <div className='flex flex-col items-center p-3 rounded bg-action-hover min-w-[100px]'>
                  <i className='tabler-box mb-1' />
                  <Typography variant='body2'>Products</Typography>
                  <Typography variant='h6'>{data.totalProduct || 0}</Typography>
               </div>
            </div>

            <Divider className='w-full' />

            <div className='w-full flex flex-col gap-2'>
              <Typography variant='h6' className='mb-2'>Details</Typography>
              <div className='flex gap-2'>
                <Typography className='font-medium min-w-[100px]'>User ID:</Typography>
                <Typography color='text.secondary'>{data._id}</Typography>
              </div>
              <div className='flex gap-2'>
                <Typography className='font-medium min-w-[100px]'>Mobile:</Typography>
                <Typography color='text.secondary'>{mobileNumber || '-'}</Typography>
              </div>
              <div className='flex gap-2'>
                <Typography className='font-medium min-w-[100px]'>Business:</Typography>
                <Typography color='text.secondary'>{businessName || '-'}</Typography>
              </div>
              <div className='flex gap-2'>
                <Typography className='font-medium min-w-[100px]'>Tag:</Typography>
                <Typography color='text.secondary'>{businessTag || '-'}</Typography>
              </div>
              <div className='flex gap-2'>
                <Typography className='font-medium min-w-[100px]'>Joined:</Typography>
                <Typography color='text.secondary'>{data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '-'}</Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* User Right Side - Additional Details */}
      <Grid item xs={12} md={7} lg={8}>
        <Grid container spacing={6}>
          {/* Address Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <div className='flex items-center gap-2 mb-4'>
                  <i className='tabler-map-pin text-xl' />
                  <Typography variant='h5'>Address Information</Typography>
                </div>
                <Divider className='mb-4' />
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Typography className='mb-1 font-medium'>Address Line</Typography>
                    <Typography color='text.secondary'>{address?.address || '-'}</Typography>
                  </Grid>
                   <Grid item xs={12} sm={6}>
                    <Typography className='mb-1 font-medium'>Landmark</Typography>
                    <Typography color='text.secondary'>{address?.landMark || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography className='mb-1 font-medium'>City</Typography>
                    <Typography color='text.secondary'>{address?.city || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography className='mb-1 font-medium'>State</Typography>
                    <Typography color='text.secondary'>{address?.state || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography className='mb-1 font-medium'>Country</Typography>
                    <Typography color='text.secondary'>{address?.country || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography className='mb-1 font-medium'>Pin Code</Typography>
                    <Typography color='text.secondary'>{address?.pinCode || '-'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Bank Details Card */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                 <div className='flex items-center gap-2 mb-4'>
                  <i className='tabler-building-bank text-xl' />
                  <Typography variant='h5'>Bank Details</Typography>
                </div>
                <Divider className='mb-4' />
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Typography className='mb-1 font-medium'>Bank Name</Typography>
                    <Typography color='text.secondary'>{bankDetails?.bankName || '-'}</Typography>
                  </Grid>
                   <Grid item xs={12} sm={6}>
                    <Typography className='mb-1 font-medium'>Account Number</Typography>
                    <Typography color='text.secondary'>{bankDetails?.accountNumber || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography className='mb-1 font-medium'>IFSC Code</Typography>
                    <Typography color='text.secondary'>{bankDetails?.IFSCCode || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography className='mb-1 font-medium'>Branch Name</Typography>
                    <Typography color='text.secondary'>{bankDetails?.branchName || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography className='mb-1 font-medium'>Business Name</Typography>
                    <Typography color='text.secondary'>{bankDetails?.bankBusinessName || '-'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SellerDetail
