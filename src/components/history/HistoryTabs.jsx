'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid2'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const HistoryTabs = ({ tabs = [], defaultTab, children }) => {
  // States
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0].value : ''))

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  if (tabs.length === 0 && !children) {
    return null
  }

  // If children is provided, use it directly
  if (children) {
    return (
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12 }}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              {tabs.map(tab => (
                <Tab
                  key={tab.value}
                  icon={tab.icon ? <i className={tab.icon} /> : undefined}
                  value={tab.value}
                  label={tab.label}
                  iconPosition={tab.icon ? 'start' : undefined}
                />
              ))}
            </CustomTabList>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TabPanel value={activeTab} className='p-0'>
              {typeof children === 'function' ? children(activeTab) : children}
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    )
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            {tabs.map(tab => (
              <Tab
                key={tab.value}
                icon={tab.icon ? <i className={tab.icon} /> : undefined}
                value={tab.value}
                label={tab.label}
                iconPosition={tab.icon ? 'start' : undefined}
              />
            ))}
          </CustomTabList>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TabPanel value={activeTab} className='p-0'>
            {tabs.find(tab => tab.value === activeTab)?.content}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default HistoryTabs
