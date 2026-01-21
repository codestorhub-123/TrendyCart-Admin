'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

const ToggleCard = ({ title, value, onChange, onLabel = 'On', offLabel = 'Off' }) => {
  return (
    <Card>
      <CardContent className='flex items-center justify-between'>
        <div className='flex flex-col'>
          <Typography variant='h6' className='mb-1'>
            {title}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {value ? onLabel : offLabel}
          </Typography>
        </div>
        <FormControlLabel
          control={<Switch checked={value || false} onChange={e => onChange(e.target.checked)} />}
          label=''
        />
      </CardContent>
    </Card>
  )
}

export default ToggleCard
