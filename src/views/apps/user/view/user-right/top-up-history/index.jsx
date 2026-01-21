'use client'

// MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Component Imports
import HistoryPage from '@/components/history/HistoryPage'
import { getTopUpHistory } from '@/services/userService'

const TopUpHistory = () => {
  const headers = ['Date', 'Coins', 'Type', 'Note', 'Status']

  const renderRow = (item, rowNumber, index) => (
    <TableRow key={item._id || index}>
      <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
      <TableCell>
        <Typography className='font-medium'>{item.coin || 0}</Typography>
      </TableCell>
      <TableCell>{item.type || 'N/A'}</TableCell>
      <TableCell>{item.note || 'N/A'}</TableCell>
      <TableCell>
        <Chip
          label={item.status || 'Completed'}
          size='small'
          color={item.status === 'completed' || !item.status ? 'success' : 'warning'}
          variant='tonal'
        />
      </TableCell>
    </TableRow>
  )

  return (
    <HistoryPage
      title='Top-up History'
      fetchFunction={getTopUpHistory}
      roleType='user'
      headers={headers}
      renderRow={renderRow}
      emptyMessage='No top-up history found'
    />
  )
}

export default TopUpHistory
