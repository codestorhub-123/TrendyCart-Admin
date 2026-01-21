'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import HistoryTable from './HistoryTable'
import TablePaginationComponent from '@components/TablePaginationComponent'

const HistoryPage = ({
  title,
  fetchFunction, // Function that takes (userId, roleType, start, limit) and returns a promise
  roleType = 'user', // 'user' or 'host'
  headers = [],
  renderRow,
  emptyMessage = 'No history found',
  pageSize = 20,
  userIdParam = 'id' // Query param name for user ID
}) => {
  // States
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // Get user ID from URL query params
  const searchParams = useSearchParams()
  const userId = searchParams.get(userIdParam)

  // Fetch history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) {
        setError(`${userIdParam} is required`)
        setLoading(false)
        return
      }

      if (!fetchFunction) {
        setError('Fetch function is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const start = currentPage * pageSize

        const response = await fetchFunction(userId, roleType, start, pageSize)

        if (response.success) {
          const data = response.data || []
          setHistory(data)
          // If returned data is less than limit, there's no more data
          setHasMore(data.length === pageSize)
        } else {
          setError(response.message || 'Failed to fetch history')
          setHistory([])
          setHasMore(false)
        }
      } catch (err) {
        console.error('Error fetching history:', err)
        setError(err.message || 'Failed to fetch history')
        setHistory([])
        setHasMore(false)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [userId, currentPage, roleType, fetchFunction, pageSize, userIdParam])

  if (loading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center pbs-12'>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center pbs-12'>
          <Typography color='error'>{error}</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className='p-0'>
        {title && (
          <div className='p-6'>
            <Typography variant='h5' className='mbe-4'>
              {title}
            </Typography>
          </div>
        )}
        <HistoryTable
          headers={headers}
          data={history}
          renderRow={renderRow}
          currentPage={currentPage}
          pageSize={pageSize}
          emptyMessage={emptyMessage}
        />
        {history.length > 0 && (
          <TablePaginationComponent
            currentPage={currentPage}
            hasMore={hasMore}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalItems={history.length}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default HistoryPage

