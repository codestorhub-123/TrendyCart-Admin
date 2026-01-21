'use client'

// React Imports
import { useSearchParams } from 'next/navigation'

// MUI Imports
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Component Imports
import HistoryPage from './HistoryPage'
import { getHistory } from '@/services/userService'

const HistoryTab = ({ historyType, roleType = 'user' }) => {
  const searchParams = useSearchParams()
  const userId = searchParams.get('id')

  // Get table config based on history type
  const getTableConfig = () => {
    switch (historyType) {
      case 'coinHistory':
        return {
          title: 'Coin History',
          headers: ['No', 'Receiver Name', 'Description', 'User Coin', 'Host Coin', 'Agency Coin', 'Income', 'Date'],
          renderRow: (item, rowNumber, index) => (
            <TableRow key={item._id || index}>
              <TableCell>{rowNumber}</TableCell>
              <TableCell>{item.recevierName || '-'}</TableCell>
              <TableCell>{item.Description || '-'}</TableCell>
              <TableCell>
                <Typography className={`font-medium ${item.userCoin > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                  {item.userCoin > 0 ? '+' : ''}
                  {item.userCoin || 0}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography className='font-medium'>{item.hostCoin || 0}</Typography>
              </TableCell>
              <TableCell>
                <Typography className='font-medium'>{item.agencyCoin || 0}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={item.userIsIncome ? 'Yes' : 'No'}
                  size='small'
                  color={item.userIsIncome ? 'success' : 'default'}
                  variant='tonal'
                />
              </TableCell>
              <TableCell>
                {item.date
                  ? new Date(item.date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'N/A'}
              </TableCell>
            </TableRow>
          )
        }
      case 'callHistory':
        return {
          title: 'Call History',
          headers: [
            'No',
            'Receiver Name',
            'Description',
            'Start Time',
            'End Time',
            'Duration (sec)',
            'Cut Reason',
            'Date'
          ],
          renderRow: (item, rowNumber, index) => (
            <TableRow key={item._id || index}>
              <TableCell>{rowNumber}</TableCell>
              <TableCell>{item.recevierName || '-'}</TableCell>
              <TableCell>{item.Description || '-'}</TableCell>
              <TableCell>{item.callStartTime || '-'}</TableCell>
              <TableCell>{item.callEndTime || '-'}</TableCell>
              <TableCell>{item.callDuration || '-'}</TableCell>
              <TableCell>{item.callCutReason || '-'}</TableCell>
              <TableCell>
                {item.date
                  ? new Date(item.date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'N/A'}
              </TableCell>
            </TableRow>
          )
        }
      case 'giftHistory':
        return {
          title: 'Gift History',
          headers: ['No', 'Receiver Name', 'Description', 'Gift Name', 'User Coin', 'Host Coin', 'Agency Coin', 'Date'],
          renderRow: (item, rowNumber, index) => (
            <TableRow key={item._id || index}>
              <TableCell>{rowNumber}</TableCell>
              <TableCell>{item.recevierName || '-'}</TableCell>
              <TableCell>{item.Description || '-'}</TableCell>
              <TableCell>{item.giftName || '-'}</TableCell>
              <TableCell>
                <Typography className='font-medium'>{item.userCoin || 0}</Typography>
              </TableCell>
              <TableCell>
                <Typography className='font-medium'>{item.hostCoin || 0}</Typography>
              </TableCell>
              <TableCell>
                <Typography className='font-medium'>{item.agencyCoin || 0}</Typography>
              </TableCell>
              <TableCell>
                {item.date || item.createdAt
                  ? new Date(item.date || item.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'N/A'}
              </TableCell>
            </TableRow>
          )
        }
      case 'purchaseCoinPlan':
      case 'planHistory':
        return {
          title: 'Purchase Coin Plan',
          headers: ['No', 'Description', 'Plan Name', 'User Coin', 'Date'],
          renderRow: (item, rowNumber, index) => (
            <TableRow key={item._id || index}>
              <TableCell>{rowNumber}</TableCell>
              <TableCell>{item.Description || '-'}</TableCell>
              <TableCell>{item.planName || '-'}</TableCell>
              <TableCell>
                <Typography className='font-medium'>{item.userCoin || 0}</Typography>
              </TableCell>
              <TableCell>
                {item.date || item.createdAt
                  ? new Date(item.date || item.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'N/A'}
              </TableCell>
            </TableRow>
          )
        }
      default:
        return {
          title: 'History',
          headers: ['Date', 'Type', 'Details', 'Status'],
          renderRow: (item, rowNumber, index) => (
            <TableRow key={item._id || index}>
              <TableCell>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
              <TableCell>{item.type || '-'}</TableCell>
              <TableCell>{JSON.stringify(item)}</TableCell>
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
        }
    }
  }

  const tableConfig = getTableConfig()

  const fetchHistory = async (userId, roleType, start, limit) => {
    return await getHistory(userId, roleType, historyType, start, limit)
  }

  return (
    <HistoryPage
      title={tableConfig.title}
      fetchFunction={fetchHistory}
      roleType={roleType}
      headers={tableConfig.headers}
      renderRow={tableConfig.renderRow}
      emptyMessage={`No ${tableConfig.title.toLowerCase()} found`}
    />
  )
}

export default HistoryTab
