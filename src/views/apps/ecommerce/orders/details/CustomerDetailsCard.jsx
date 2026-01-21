// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import EditUserInfo from '@components/dialogs/edit-user-info'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

// Util Imports
import { getInitials } from '@/utils/getInitials'

const getAvatar = params => {
  const { avatar, customer } = params

  if (avatar) {
    return <Avatar src={avatar} />
  } else {
    return <Avatar>{getInitials(customer)}</Avatar>
  }
}

// Vars
const userData = {
  firstName: 'Gabrielle',
  lastName: 'Feyer',
  userName: '@gabriellefeyer',
  billingEmail: 'gfeyer0@nyu.edu',
  status: 'active',
  role: 'Customer',
  taxId: 'Tax-8894',
  contact: '+1 (234) 464-0600',
  language: ['English'],
  country: 'France',
  useAsBillingAddress: true
}

const CustomerDetails = ({ orderData }) => {
  const customer = orderData?.userId
  
  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <Typography variant='h5'>Customer details</Typography>
        <div className='flex items-center gap-3'>
          <CustomAvatar 
            src={customer?.image || ''} 
            alt={customer?.name || 'Customer'}
          />
          <div className='flex flex-col'>
            <Typography color='text.primary' className='font-medium'>
              {customer?.name || customer?.firstName || 'N/A'}
            </Typography>
            <Typography>Customer ID: {customer?._id || 'N/A'}</Typography>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <CustomAvatar skin='light' color='success' size={40}>
            <i className='tabler-shopping-cart' />
          </CustomAvatar>
          <Typography color='text.primary' className='font-medium'>
            {customer?.orderCount || 0} Orders
          </Typography>
        </div>
        <div className='flex flex-col gap-1'>
          <div className='flex justify-between items-center'>
            <Typography color='text.primary' className='font-medium'>
              Contact info
            </Typography>
          </div>
          <Typography>Email: {customer?.email || 'N/A'}</Typography>
          <Typography>Mobile: {customer?.mobileNumber || 'N/A'}</Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerDetails
