'use client'

// MUI Imports
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'

const DetailsSection = ({ fields = [] }) => {
  const renderField = (field, index) => {
    const { label, value, render, condition = true } = field

    if (!condition) return null

    if (render) {
      return <div key={index}>{render(value)}</div>
    }

    // Default rendering
    if (typeof value === 'boolean') {
      return (
        <div key={index} className='flex items-center flex-wrap gap-x-1.5'>
          <Typography className='font-medium' color='text.primary'>
            {label}:
          </Typography>
          <Chip variant='tonal' label={value ? 'Yes' : 'No'} size='small' color={value ? 'success' : 'default'} />
        </div>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div key={index} className='flex items-start flex-wrap gap-x-1.5'>
          <Typography className='font-medium' color='text.primary'>
            {label}:
          </Typography>
          <Typography color='text.primary'>{value.join(', ') || 'N/A'}</Typography>
        </div>
      )
    }

    return (
      <div key={index} className='flex items-center flex-wrap gap-x-1.5'>
        <Typography className='font-medium' color='text.primary'>
          {label}:
        </Typography>
        <Typography color='text.primary'>{value || 'N/A'}</Typography>
      </div>
    )
  }

  return (
    <div>
      <Typography variant='h5'>Details</Typography>
      <Divider className='mlb-4' />
      <div className='flex flex-col gap-2'>{fields.map((field, index) => renderField(field, index))}</div>
    </div>
  )
}

export default DetailsSection
