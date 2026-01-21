'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'

// Component Imports
import SendNotificationDialog from './SendNotificationDialog'

const NotificationDropdown = ({ notifications }) => {
  // States
  const [open, setOpen] = useState(false)

  // Vars
  const notificationCount = notifications.filter(notification => !notification.read).length

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  return (
    <>
      <IconButton onClick={handleToggle} className='text-textPrimary'>
        <Badge
          color='error'
          className='cursor-pointer'
          variant='dot'
          overlap='circular'
          invisible={notificationCount === 0}
          sx={{
            '& .MuiBadge-dot': { top: 6, right: 5, boxShadow: 'var(--mui-palette-background-paper) 0px 0px 0px 2px' }
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='tabler-bell' />
        </Badge>
      </IconButton>
      <SendNotificationDialog open={open} handleClose={handleClose} />
    </>
  )
}

export default NotificationDropdown
