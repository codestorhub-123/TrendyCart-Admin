'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// Third-party Imports
import { useSelector } from 'react-redux'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const RecentOrderTable = () => {
  // States
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const { currency } = useSelector(state => state.settingsReducer)
  const { lang: locale } = useParams()
  const router = useRouter()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getRecentOrders()

      if (res && (res.status === true || res.success)) {
        setData(res.orders || [])
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Card className='bs-full'>
      <CardHeader
        title='Recent Order'
        // action={<OptionMenu options={['Refresh', 'Share', 'Update']} />}
      />
      <CardContent className='!p-0'>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead className='uppercase'>
              <tr className='border-be'>
                <th className='leading-6 plb-4 pis-6 pli-2'>No</th>
                <th className='leading-6 plb-4 pli-2'>Order Id</th>
                <th className='leading-6 plb-4 pli-2'>User</th>
                <th className='leading-6 plb-4 pli-2 text-center'>PaymentGateway</th>
                <th className='leading-6 plb-4 pie-6 pli-2 text-center'>Total ({currency})</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className='text-center plb-10'>
                    <Typography>Loading...</Typography>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className='text-center plb-10'>
                    <Typography>No Data Found</Typography>
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                    const userObj = row.userId || row.user || {}
                    const firstName = userObj.firstName || ''
                    const lastName = userObj.lastName || ''
                    const userName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (userObj.fullName || userObj.name || '-')
                    
                    return (
                        <tr 
                          key={index} 
                          className='border-0 cursor-pointer hover:bg-[var(--mui-palette-action-hover)] transition-colors'
                          onClick={() => router.push(`/${locale}/apps/ecommerce/orders/details/${row._id}`)}
                        >
                        <td className='pis-6 pli-2 plb-3'>
                            <Typography color='text.primary'>{index + 1}</Typography>
                        </td>
                        <td className='pli-2 plb-3'>
                            <Typography color='primary.main' className='font-medium'>
                                {row.orderId || (row._id && `INV#${row._id.slice(-5).toUpperCase()}`) || '-'}
                            </Typography>
                        </td>
                        <td className='pli-2 plb-3'>
                            <Typography color='text.primary'>{userName}</Typography>
                        </td>
                        <td className='pli-2 plb-3 text-center'>
                            <Typography color='text.primary' className='capitalize'>
                                {row.paymentMethod || row.paymentGateway || row.paymentType || '-'}
                            </Typography>
                        </td>
                        <td className='pli-2 plb-3 pie-6 text-center'>
                            <Typography color='text.primary'>
                                {row.totalAmount || row.grandTotal || row.total || 0}
                            </Typography>
                        </td>
                        </tr>
                    )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecentOrderTable
