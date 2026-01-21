// MUI Imports
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'

// Component Imports
import ConfirmationDialog from '@components/dialogs/confirmation-dialog'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

export const paymentStatus = {
  1: { text: 'Cash on Delivery', color: 'warning' },
  2: { text: 'Paid', color: 'success' }
}

export const statusChipColor = {
  Delivered: 'success',
  Cancelled: 'error',
  Pending: 'warning',
  Confirmed: 'info',
  'Out Of Delivery': 'info'
}

const OrderDetailHeader = ({ orderData, order }) => {
  // Vars
  const buttonProps = (children, color, variant) => ({
    children,
    color,
    variant
  })

  const status = orderData?.status || orderData?.items?.[0]?.status
  const statusLabel = status === 0 ? 'Pending' : status
  const payment = orderData?.paymentStatus || 0
  
  return (
    <div className='flex flex-wrap justify-between sm:items-center max-sm:flex-col gap-y-4'>
      <div className='flex flex-col items-start gap-1'>
        <div className='flex items-center gap-2'>
          <Typography variant='h5'>{`Order ${orderData?.orderId || order}`}</Typography>
          <Chip
            variant='tonal'
            label={statusLabel}
            color={statusChipColor[statusLabel] || 'primary'}
            size='small'
          />
          <Chip
            variant='tonal'
            label={paymentStatus[payment]?.text || 'Unknown'}
            color={paymentStatus[payment]?.color || 'secondary'}
            size='small'
          />
        </div>
        <Typography>
          {(() => {
            if (!orderData?.createdAt) return ''
            const date = new Date(orderData.createdAt)
            return !isNaN(date.getTime()) 
              ? date.toLocaleDateString('en-GB') 
              : orderData.createdAt
          })()}
        </Typography>
      </div>
    </div>
  )
}

export default OrderDetailHeader
