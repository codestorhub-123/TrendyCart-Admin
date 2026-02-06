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

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Service Imports
import { getUserChartAnalytics } from '@/services/dashboardService'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const UserAnalyticsChart = () => {
  // States
  const [series, setSeries] = useState([{ name: 'Users', data: [] }])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Hooks
  const theme = useTheme()

  // Vars
  const textDisabled = 'var(--mui-palette-text-disabled)'
  const primaryColor = theme.palette.primary.main

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetching with 'All' as per user swagger
      const res = await getUserChartAnalytics('All', 'All')

      if (res && res.status) {
        const fetchedData = res.chartAnalyticOfUsers || res.data || []

        // Mapping based on user provided JSON structure
        const chartData = fetchedData.map(item => item.count || item.users || 0)
        const labels = fetchedData.map(item => item._id || item.date || '')

        setSeries([{ name: 'Users', data: chartData }])
        setCategories(labels)
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error)
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
    colors: [primaryColor],
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        gradientToColors: [theme.palette.primary.main],
        shadeIntensity: 1,
        type: 'vertical',
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 100, 100, 100]
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
        }
      }
    },
    tooltip: {
      x: { show: true }
    }
  }

  return (
    <Card className='bs-full'>
      <CardHeader
        title='User Analytics'
        subheader='Date wise chart analytics for users'
        // action={<OptionMenu options={['Refresh', 'Download', 'Update']} />}
      />
      <CardContent>
        {loading ? (
          <div className='flex items-center justify-center bs-[300px]'>
            <Typography>Loading...</Typography>
          </div>
        ) : (
          <AppReactApexCharts type='area' height={341} width='100%' series={series} options={options} />
        )}
      </CardContent>
    </Card>
  )
}

export default UserAnalyticsChart
