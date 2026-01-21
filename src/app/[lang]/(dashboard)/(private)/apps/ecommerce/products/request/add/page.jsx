'use client'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const ProductRequestAddPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Create Product Request' />
          <CardContent>
            <Typography>
              Form to submit a new product request for review.
            </Typography>
            <Typography variant='body2' color='textSecondary' className='mt-2'>
              Coming Soon...
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProductRequestAddPage
