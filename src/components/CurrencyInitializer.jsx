'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setCurrency } from '@/redux-store/slices/settings'
import { getDefaultCurrency } from '@/services/currencyService'

const CurrencyInitializer = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchDefaultCurrency = async () => {
      try {
        const res = await getDefaultCurrency()
        if (res.status && res.data && res.data.currencySymbol) {
          dispatch(setCurrency(res.data.currencySymbol))
        }
      } catch (error) {
        console.error('Failed to fetch default currency:', error)
      }
    }

    fetchDefaultCurrency()
  }, [dispatch])

  return null
}

export default CurrencyInitializer
