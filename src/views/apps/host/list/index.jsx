// React Imports
'use client'

import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import HostListTable from './HostListTable'
import HostListCards from './HostListCards'

const HostList = ({ hostData }) => {
  const [isFake, setIsFake] = useState(false)

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <HostListCards isFake={isFake} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <HostListTable tableData={hostData} isFake={isFake} setIsFake={setIsFake} />
      </Grid>
    </Grid>
  )
}

export default HostList
