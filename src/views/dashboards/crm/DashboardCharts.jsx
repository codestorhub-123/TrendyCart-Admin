'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

// Next Imports
import dynamic from 'next/dynamic'

// Third-party Imports
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from '@/libs/Recharts'

// Styled Component Imports
const AppRecharts = dynamic(() => import('@/libs/styles/AppRecharts'))

// Component Imports
import { fetchDashboardData } from '@/services/userService'

const DashboardCharts = () => {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true)
        const data = await fetchDashboardData()
        console.log('DashboardCharts - Received data:', data)
        if (data?.chart) {
          setChartData(data.chart)
        }
      } catch (error) {
        console.error('Error loading chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChartData()
  }, [])

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent className='flex justify-center items-center py-20'>
              <CircularProgress />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  if (!chartData) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography color='text.secondary'>No chart data available</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  // Format chart data for Recharts
  const formatChartData = data => {
    if (!Array.isArray(data) || data.length === 0) return []

    return data.map(item => ({
      date: item._id || item.date,
      count: item.count || 0
    }))
  }

  const usersChartData = formatChartData(chartData.totalUsers || [])
  const hostsChartData = formatChartData(chartData.totalHosts || [])

  return (
    <Grid container spacing={6}>
      {usersChartData.length > 0 && (
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardHeader title='Total Users Over Time' />
            <CardContent>
              <AppRecharts>
                <div className='bs-[300px]'>
                  <ResponsiveContainer>
                    <LineChart data={usersChartData} height={300}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type='monotone' dataKey='count' stroke='#8884d8' name='Users' />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </AppRecharts>
            </CardContent>
          </Card>
        </Grid>
      )}
      {hostsChartData.length > 0 && (
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardHeader title='Total Hosts Over Time' />
            <CardContent>
              <AppRecharts>
                <div className='bs-[300px]'>
                  <ResponsiveContainer>
                    <BarChart data={hostsChartData} height={300}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='date' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey='count' fill='#82ca9d' name='Hosts' />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </AppRecharts>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}

export default DashboardCharts
