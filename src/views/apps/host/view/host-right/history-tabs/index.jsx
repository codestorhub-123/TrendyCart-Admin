'use client'

// Component Imports
import HistoryTabs from '@/components/history/HistoryTabs'
import HistoryTab from '@/components/history/HistoryTab'

const HostHistoryTabs = () => {
  const tabs = [
    {
      value: 'coinHistory',
      label: 'Coin History',
      icon: 'tabler-coin',
      content: <HistoryTab historyType='coinHistory' roleType='host' />
    },
    {
      value: 'callHistory',
      label: 'Call History',
      icon: 'tabler-phone-call',
      content: <HistoryTab historyType='callHistory' roleType='host' />
    },
    {
      value: 'giftHistory',
      label: 'Gift History',
      icon: 'tabler-gift',
      content: <HistoryTab historyType='giftHistory' roleType='host' />
    }
  ]

  return <HistoryTabs tabs={tabs} defaultTab='coinHistory' />
}

export default HostHistoryTabs
