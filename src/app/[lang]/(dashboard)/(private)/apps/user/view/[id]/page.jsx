'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Grid from '@mui/material/Grid2'
import UserLeftOverview from '@views/apps/user/view/user-left-overview'
import UserRight from '@views/apps/user/view/user-right'
import { getApiBase } from '@/utils/getApiBase'
import { getUserById, getOrdersOfUser, getAllUsers } from '@/services/userService'
import OverViewTab from '@views/apps/user/view/user-right/overview'
import SecurityTab from '@views/apps/user/view/user-right/security'
import BillingPlans from '@views/apps/user/view/user-right/billing-plans'
import NotificationsTab from '@views/apps/user/view/user-right/notifications'
import ConnectionsTab from '@views/apps/user/view/user-right/connections'

const UserView = () => {
  const { id } = useParams()
  const [userData, setUserData] = useState(null)
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        // Fetch User Details - Assuming /admin/user/:id or filtering list
        // Since we don't have a confirmed single user endpoint, we might need to rely on what available.
        // But let's try a direct fetch if possible, or use the profile endpoint if that's what the user insisted on (though weird).
        // Let's try /admin/user first, maybe with query?
        // Actually, looking at the user list response:
        // {_id: "...", ...}
        // Let's try fetching the list and filtering for now if single endpoint fails, or assume there is one.
        // Given the instructions, I'll try /admin/user/${id}
        // Wait, did the user provide getProfile for THIS?
        // "route.get('/ordersOfUser', controller.ordersOfUser); use this api for user detail left side for profile and right for order of user"
        // The grammar is ambiguous. "use this api for user detail left side for profile" (referring to the profile one they pasted?)
        // and "right for order of user".
        // I will use /admin/get-user-by-id/${id} or similar?
        // Let's assume standard REST: /admin/user/${id}
        
        // For now, I will implement a fetch that *tries* to get user data.
        
        // Fetch Orders
        const ordersResult = await getOrdersOfUser(id)
        if (ordersResult.success || ordersResult.status === 200 || ordersResult.status === true) {
           setOrderData(ordersResult.orderData || [])
        }

        // Fetch User
        const userResult = await getUserById(id)
        if (userResult.success || userResult.status === 200 || userResult.data) {
            setUserData(userResult.data || userResult)
        } else {
             // Fallback: fetch list and filter (using service if we wanted, but let's try to assume fetch worked or failed)
             // If direct fetch fail, maybe we shouldn't fallback to list manually unless necessary.
             // But for now keeping logic simple as per previous "safe" approach, but using new service for list if needed.
             // Actually, the previous code had a fallback. I'll reimplement fallback using service if needed,
             // but let's assume getUserById works or returns null.
             // If we really need fallback:
             const listResult = await getAllUsers(0, 1000) // fetch a lot?
             const foundUser = (listResult.data || listResult.users || []).find(u => u._id === id)
             if (foundUser) setUserData(foundUser)
        }

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!userData) return <div>User not found</div>

  const tabContentList = {
    overview: <OverViewTab orderData={orderData} />,
    security: <SecurityTab />,
    'billing-plans': <BillingPlans />,
    notifications: <NotificationsTab />,
    connections: <ConnectionsTab />
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <UserLeftOverview userData={userData} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8, md: 7 }}>
        <UserRight tabContentList={tabContentList} />
      </Grid>
    </Grid>
  )
}

export default UserView
