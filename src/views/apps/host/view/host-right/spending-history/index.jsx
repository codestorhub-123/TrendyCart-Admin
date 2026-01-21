'use client'

// MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Component Imports
import HistoryPage from '@/components/history/HistoryPage'
import { getSpendingHistory } from '@/services/userService'

const SpendingHistory = () => {
  const headers = ['Date', 'Coins', 'Type', 'Status']

  const renderRow = (item, rowNumber, index) => (
                    <TableRow key={item._id || index}>
                      <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Typography className='font-medium text-error'> - {item.coin || 0} Coins</Typography>
                      </TableCell>
                      <TableCell>{item.type || '-'}</TableCell>
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
      title='Spending History'
      fetchFunction={getSpendingHistory}
      roleType='user'
      headers={headers}
      renderRow={renderRow}
      emptyMessage='No spending history found'
    />
  )
}

export default SpendingHistory
