'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

// Third-party Imports
import { useSelector } from 'react-redux'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Service Imports
import { getRevenueAnalytics } from '@/services/dashboardService'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const RevenueAnalyticsChart = () => {
  // States
  const [series, setSeries] = useState([{ name: 'Revenue', data: [] }])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Hooks
  const theme = useTheme()
  const { currency } = useSelector(state => state.settingsReducer)

  // Vars
  const textDisabled = 'var(--mui-palette-text-disabled)'
  const infoColor = theme.palette.info.main

  const getFormattedDate = (date) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        // Default to last 30 days
        const endDate = getFormattedDate(new Date())
        const startDate = getFormattedDate(new Date(new Date().setDate(new Date().getDate() - 30)))

        const res = await getRevenueAnalytics(startDate, endDate)

        if (res && res.status) {
          // Check for the specific array from the recent API response
          let fetchedData = res.totalEarningWithCommission || res.revenueAnalyticsChartData || res.revenueAnalytics || res.data || []

          // Sort data by date (assuming _id is DD-MM-YYYY)
          fetchedData = [...fetchedData].sort((a, b) => {
             const dateA = a._id ? a._id.split('-').reverse().join('-') : ''
             const dateB = b._id ? b._id.split('-').reverse().join('-') : ''
             return new Date(dateA) - new Date(dateB)
          })

          // Map the data
          const chartData = fetchedData.map(item => item.totalEarningWithCommission || item.revenue || item.totalAmount || item.total || item.count || 0)
          const labels = fetchedData.map(item => item._id || item.date || '')

          setSeries([{ name: 'Revenue', data: chartData }])
          setCategories(labels)
        }
      } catch (error) {
        console.error('Error fetching revenue analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const options = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    colors: [infoColor],
    stroke: { width: 3, curve: 'smooth' },
    dataLabels: { enabled: false },
    grid: {
      show: true,
      borderColor: 'var(--mui-palette-divider)',
      strokeDashArray: 7,
      padding: {
        top: -20,
        bottom: -10,
        left: 0,
        right: 0
      }
    },
    xaxis: {
      categories: categories,
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: {
        style: {
          fontSize: '13px',
          colors: textDisabled
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '13px',
          colors: textDisabled
        },
        formatter: val => `${currency}${val}`
      }
    },
    tooltip: {
      y: {
        formatter: val => `${currency}${val}`
      }
    }
  }

  return (
    <Card className='bs-full'>
      <CardHeader
        title='Revenue Analytics'
        subheader='Revenue analytics chart data'
        // action={<OptionMenu options={['Last Month', 'Last 6 Months', 'Last Year']} />}
      />
      <CardContent>
        {loading ? (
          <div className='flex items-center justify-center bs-[300px]'>
            <Typography>Loading...</Typography>
          </div>
        ) : (
          <AppReactApexCharts type='line' height={341} width='100%' series={series} options={options} />
        )}
      </CardContent>
    </Card>
  )
}

export default RevenueAnalyticsChart
