'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const InputCard = ({ title, value, onChange, type = 'number' }) => {
  return (
    <Card>
      <CardContent>
        <CustomTextField
          fullWidth
          label={title}
          type={type}
          value={value || ''}
          onChange={e => {
            const newValue = type === 'number' ? Number(e.target.value) : e.target.value
            onChange(newValue)
          }}
          placeholder={`Enter ${title.toLowerCase()}`}
        />
      </CardContent>
    </Card>
  )
}

export default InputCard
