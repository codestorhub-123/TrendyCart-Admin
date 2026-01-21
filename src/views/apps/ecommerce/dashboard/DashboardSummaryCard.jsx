// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import { useRouter } from 'next/navigation'

const DashboardSummaryCard = props => {
  // Props
  const { title, stats, avatarIcon, avatarColor, href } = props

  // Hooks
  const router = useRouter()

  return (
    <Card 
      className='bs-full cursor-pointer hover:shadow-md transition-shadow'
      onClick={() => href && router.push(href)}
    >
      <CardContent className='flex flex-col gap-y-3'>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            <Typography variant='h4'>{stats}</Typography>
            <Typography color='text.secondary'>{title}</Typography>
          </div>
          <CustomAvatar color={avatarColor} skin='light' variant='rounded' size={42}>
            <i className={classnames(avatarIcon, 'text-[26px]')} />
          </CustomAvatar>
        </div>
        <Typography
          color='primary'
          variant='body2'
          className='font-medium mt-auto transition-all hover:translate-x-1'
        >
          View All Details <i className='tabler-chevron-right text-xs' />
        </Typography>
      </CardContent>
    </Card>
  )
}

export default DashboardSummaryCard
