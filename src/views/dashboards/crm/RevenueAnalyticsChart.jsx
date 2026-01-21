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

  const fetchData = async () => {
    setLoading(true)
    try {
      // Default to last 30 days
      const endDate = getFormattedDate(new Date())
      const startDate = getFormattedDate(new Date(new Date().setDate(new Date().getDate() - 30)))
      
      const res = await getRevenueAnalytics(startDate, endDate)
      if (res && res.status) {
        const fetchedData = res.revenueAnalyticsChartData || res.revenueAnalytics || res.data || []
        
        // Adjust mapping based on actual API response structure
        const chartData = fetchedData.map(item => item.revenue || item.totalAmount || item.total || item.count || 0)
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

  useEffect(() => {
    fetchData()
  }, [])

  const options = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    colors: [infoColor],
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '40%',
        startingShape: 'rounded',
        endingShape: 'rounded'
      }
    },
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
          <AppReactApexCharts type='bar' height={341} width='100%' series={series} options={options} />
        )}
      </CardContent>
    </Card>
  )
}

export default RevenueAnalyticsChart
