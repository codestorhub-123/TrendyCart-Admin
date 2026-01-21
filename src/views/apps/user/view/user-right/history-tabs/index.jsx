'use client'

// Component Imports
import HistoryTabs from '@/components/history/HistoryTabs'
import HistoryTab from '@/components/history/HistoryTab'

const UserHistoryTabs = () => {
  const tabs = [
    {
      value: 'coinHistory',
      label: 'Coin History',
      icon: 'tabler-coin',
      content: <HistoryTab historyType='coinHistory' roleType='user' />
    },
    {
      value: 'callHistory',
      label: 'Call History',
      icon: 'tabler-phone-call',
      content: <HistoryTab historyType='callHistory' roleType='user' />
    },
    {
      value: 'giftHistory',
      label: 'Gift History',
      icon: 'tabler-gift',
      content: <HistoryTab historyType='giftHistory' roleType='user' />
    },
    {
      value: 'planHistory',
      label: 'Purchase Coin Plan',
      icon: 'tabler-shopping-cart',
      content: <HistoryTab historyType='planHistory' roleType='user' />
    }
  ]

  return <HistoryTabs tabs={tabs} defaultTab='coinHistory' />
}

export default UserHistoryTabs
