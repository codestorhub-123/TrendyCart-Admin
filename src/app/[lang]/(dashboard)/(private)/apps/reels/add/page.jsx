'use client'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const ReelsAddPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Add New Reel' />
          <CardContent>
            <Typography>
              Upload and publish new reels to the platform.
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

export default ReelsAddPage
