'use client'

// Component Imports
import HistoryTab from '@/components/history/HistoryTab'

const History = ({ historyType }) => {
  return <HistoryTab historyType={historyType} roleType='host' />
}

export default History
