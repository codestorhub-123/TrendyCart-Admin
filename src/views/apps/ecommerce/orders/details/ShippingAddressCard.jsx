// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import AddAddress from '@components/dialogs/add-edit-address'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'

// Vars
const data = {
  firstName: 'Roker',
  lastName: 'Terrace',
  email: 'sbaser0@boston.com',
  country: 'UK',
  address1: 'Latheronwheel',
  address2: 'KW5 8NW, London',
  landmark: 'Near Water Plant',
  city: 'London',
  state: 'Capholim',
  zipCode: '403114',
  taxId: 'TAX-875623',
  vatNumber: 'SDF754K77',
  contact: '+1 (609) 972-22-22'
}

const ShippingAddress = ({ orderData }) => {
  const address = orderData?.addressId
  
  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex justify-between items-center'>
          <Typography variant='h5'>Shipping Address</Typography>
        </div>
        <div className='flex flex-col'>
          <Typography>{address?.firstName} {address?.lastName}</Typography>
          <Typography>{address?.address || address?.address1}</Typography>
          <Typography>{address?.city}, {address?.state} {address?.zipCode}</Typography>
          <Typography>{address?.country}</Typography>
          {address?.mobileNumber && <Typography>Contact: {address.mobileNumber}</Typography>}
        </div>
      </CardContent>
    </Card>
  )
}

export default ShippingAddress
