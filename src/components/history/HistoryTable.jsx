'use client'

// MUI Imports
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

const HistoryTable = ({
  headers = [],
  data = [],
  renderRow,
  currentPage = 0,
  pageSize = 20,
  emptyMessage = 'No data found'
}) => {
  if (data.length === 0) {
    return (
      <div className='p-6'>
        <Typography className='text-center p-6'>{emptyMessage}</Typography>
      </div>
    )
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header, idx) => (
              <TableCell key={idx}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => {
            if (renderRow) {
              return renderRow(item, currentPage * pageSize + index, index)
            }
            // Default rendering if no renderRow provided
            return (
              <TableRow key={item._id || index}>
                <TableCell colSpan={headers.length}>
                  <Typography>No render function provided</Typography>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default HistoryTable
