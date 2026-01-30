'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import Rating from '@mui/material/Rating'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import { getInitials } from '@/utils/getInitials'
import { getImageUrl } from '@/utils/imageUrl'

// Service Imports
import { 
  getTopSellingProducts, 
  getPopularProducts, 
  getTopSellers, 
  getTopCustomers 
} from '@/services/dashboardService'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const TopProductsSellersTabs = () => {
  // States
  const [activeTab, setActiveTab] = useState('top-selling')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // Hooks
  const { lang: locale } = useParams()
  const router = useRouter()

  const fetchData = async (tab) => {
    setLoading(true)
    try {
      let res
      if (tab === 'top-selling') res = await getTopSellingProducts()
      else if (tab === 'most-popular') res = await getPopularProducts()
      else if (tab === 'top-seller') res = await getTopSellers()
      else if (tab === 'top-buyer') res = await getTopCustomers()

      if (res && (res.status === true || res.success)) {
        // Map data based on known API keys
        const fetchedData = 
          res.data || 
          res.products || 
          res.topSellingProducts || 
          res.popularProducts || 
          res.topSellers || 
          res.topCustomers || 
          res.sellers || 
          res.customers || 
          []
        setData(fetchedData)
      } else {
        setData([])
      }
    } catch (error) {
      console.error('Error fetching dashboard tab data:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(activeTab)
  }, [activeTab])

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const renderProductRow = (row, index) => {
    const productId = row.id || row._id
    const productName = row.productName || row.name || row.title || 'Product'
    const productImage = row.mainImage || row.image || row.avatar
    const category = row.category?.name || row.categoryName || row.category || row.subCategoryName || '-'
    const soldCount = row.sold || row.totalSold || row.totalProductsSold || 0

    return (
      <tr key={index} className='border-0'>
        <td className='pis-6 pli-2 plb-3'>
          <Typography color='text.primary'>{index + 1}</Typography>
        </td>
        <td className='pli-2 plb-3'>
          <div 
            className='flex items-center gap-4 cursor-pointer' 
            onClick={() => productId && router.push(`/${locale}/apps/ecommerce/products/detail/${productId}`)}
          >
            <CustomAvatar 
              src={getImageUrl(productImage)} 
              size={34} 
              variant='rounded'
              skin={productImage ? 'filled' : 'light'}
              color={productImage ? undefined : 'primary'}
            >
              {getInitials(productName)}
            </CustomAvatar>
            <Typography color='text.primary' className='font-medium max-is-[200px] truncate hover:text-primary transition-colors'>
              {productName}
            </Typography>
          </div>
        </td>
        <td className='pli-2 plb-3 text-center'>
          <Typography color='text.primary'>
            {activeTab === 'most-popular' ? category : soldCount}
          </Typography>
        </td>
        <td className='pli-2 plb-3 pie-6 text-center'>
          <div className='flex items-center justify-center gap-1'>
            <Rating size='small' value={row.rating || row.avgRating || 0} readOnly />
            {/* <Typography variant='body2'>({row.rating || row.reviewCount || 0})</Typography> */}
          </div>
        </td>
      </tr>
    )
  }

  const renderUserRow = (row, index) => {
    // Top Buyer has nested user object, Top Seller is flat
    const user = row.user || row
    const fullName = user.fullName || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.name || user.username || 'User'))
    
    // Column values for Seller
    const totalProduct = row.totalProduct !== undefined ? row.totalProduct : '-'
    const totalSoldProduct = row.totalProductsSold || row.soldCount || 0
    
    // Column values for Buyer
    const country = user.location || user.country || row.country || '-'
    const totalOrder = row.orderCount || row.totalOrders || row.totalPurchases || 0

    return (
      <tr key={index} className='border-0'>
        <td className='pis-6 pli-2 plb-3'>
          <Typography color='text.primary'>{index + 1}</Typography>
        </td>
        <td className='pli-2 plb-3'>
          <div 
            className='flex items-center gap-4 cursor-pointer group'
            onClick={() => router.push(`/${locale}/apps/user/view/${user._id || user.id || row.userId}`)}
          >
            <CustomAvatar 
              src={getImageUrl(user.image || user.avatar)} 
              size={34} 
              variant='rounded'
              skin={user.image || user.avatar ? 'filled' : 'light'}
              color={user.image || user.avatar ? undefined : 'primary'}
              sx={{
                 backgroundColor: user.image || user.avatar ? undefined : 'var(--mui-palette-primary-lightOpacity)',
                 color: user.image || user.avatar ? undefined : 'var(--mui-palette-primary-main)'
              }}
            >
               {getInitials(fullName)}
            </CustomAvatar>
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium text-wrap group-hover:text-primary transition-colors'>
                {fullName}
              </Typography>
              {user.email && (
                <Typography variant='body2' color='text.disabled' className='truncate max-is-[150px]'>
                  {user.email}
                </Typography>
              )}
            </div>
          </div>
        </td>
        <td className='pli-2 plb-3 text-center'>
          <Typography color='text.primary'>
            {activeTab === 'top-seller' ? totalProduct : country}
          </Typography>
        </td>
        <td className='pli-2 plb-3 pie-6 text-center'>
          <Typography color='text.primary'>
            {activeTab === 'top-seller' ? totalSoldProduct : totalOrder}
          </Typography>
        </td>
      </tr>
    )
  }

  return (
    <Card className='bs-full'>
      <CardHeader
        title='Statistics Overview'
        // action={<OptionMenu options={['Refresh', 'Share', 'Update']} />}
      />
      <TabContext value={activeTab}>
        <TabList
          variant='scrollable'
          scrollButtons='auto'
          onChange={handleTabChange}
          className='border-bs'
        >
          <Tab value='top-selling' label='Top Selling Product' />
          <Tab value='most-popular' label='Most Popular Product' />
          <Tab value='top-seller' label='Top Seller' />
          <Tab value='top-buyer' label='Top Buyer' />
        </TabList>
        <CardContent className='!p-0'>
          <TabPanel value={activeTab} className='!p-0'>
            <div className='overflow-x-auto'>
              <table className={tableStyles.table}>
                <thead className='uppercase'>
                  <tr className='border-be'>
                    <th className='leading-6 plb-4 pis-6 pli-2'>No</th>
                    {activeTab === 'top-selling' ? (
                      <>
                        <th className='leading-6 plb-4 pli-2'>Product</th>
                        <th className='leading-6 plb-4 pli-2 text-center'>Sold</th>
                        <th className='leading-6 plb-4 pie-6 pli-2 text-center'>Rating</th>
                      </>
                    ) : activeTab === 'most-popular' ? (
                      <>
                        <th className='leading-6 plb-4 pli-2'>Product</th>
                        <th className='leading-6 plb-4 pli-2 text-center'>Category</th>
                        <th className='leading-6 plb-4 pie-6 pli-2 text-center'>Rating</th>
                      </>
                    ) : activeTab === 'top-seller' ? (
                      <>
                        <th className='leading-6 plb-4 pli-2'>Seller</th>
                        <th className='leading-6 plb-4 pli-2 text-center'>Total Product</th>
                        <th className='leading-6 plb-4 pie-6 pli-2 text-center'>Total Sold Product</th>
                      </>
                    ) : (
                      <>
                        <th className='leading-6 plb-4 pli-2'>User</th>
                        <th className='leading-6 plb-4 pli-2 text-center'>Country</th>
                        <th className='leading-6 plb-4 pie-6 pli-2 text-center'>Total Order</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className='text-center plb-10'>
                        <Typography>Loading...</Typography>
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={4} className='text-center plb-10'>
                        <Typography>No Data Found</Typography>
                      </td>
                    </tr>
                  ) : (
                    data.map((row, index) => 
                      (activeTab === 'top-selling' || activeTab === 'most-popular') ? renderProductRow(row, index) : renderUserRow(row, index)
                    )
                  )}
                </tbody>
              </table>
            </div>
          </TabPanel>
        </CardContent>
      </TabContext>
    </Card>
  )
}

export default TopProductsSellersTabs
