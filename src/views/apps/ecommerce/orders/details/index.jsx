'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Skeleton from '@mui/material/Skeleton'

// Component Imports
import OrderDetailHeader from './OrderDetailHeader'
import OrderDetailsCard from './OrderDetailsCard'
import ShippingActivity from './ShippingActivityCard'
import CustomerDetails from './CustomerDetailsCard'
import ShippingAddress from './ShippingAddressCard'
import BillingAddress from './BillingAddressCard'

// Service Imports
import { getOrderDetails } from '@/services/orderService'

const OrderDetails = ({ order }) => {
  // States
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (order) {
      getOrderDetails(order)
        .then(res => {
          if (res.status) {
            setOrderData(res.order)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [order])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Skeleton variant='rectangular' height={50} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Skeleton variant='rectangular' height={400} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Skeleton variant='rectangular' height={400} />
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <OrderDetailHeader orderData={orderData} order={order} />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <OrderDetailsCard orderData={orderData} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ShippingActivity order={order} orderData={orderData} />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <CustomerDetails orderData={orderData} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ShippingAddress orderData={orderData} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <BillingAddress orderData={orderData} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default OrderDetails
