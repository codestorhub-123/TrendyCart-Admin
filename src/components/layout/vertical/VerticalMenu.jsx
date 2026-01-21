// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'
import { signOut } from 'next-auth/react'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href={`/${locale}/dashboards/crm`} icon={<i className='tabler-smart-home' />}>
          {dictionary['navigation'].dashboards}
        </MenuItem>
        
        <MenuSection label={dictionary['navigation'].productManagement}>
          <MenuItem href={`/${locale}/apps/ecommerce/products/attribute`} icon={<i className='tabler-key' />}>
            {dictionary['navigation'].attribute}
          </MenuItem>
          <MenuItem
            href={`/${locale}/apps/ecommerce/products/category`}
            icon={<i className='tabler-category' />}
            exactMatch={false}
            activeUrl='/apps/ecommerce/products/category'
          >
            {dictionary['navigation'].category}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/ecommerce/promo-code`} icon={<i className='tabler-percentage' />}>
            {dictionary['navigation'].promoCode}
          </MenuItem>
          <SubMenu label={dictionary['navigation'].productRequest} icon={<i className='tabler-shopping-cart-check' />}>
            <MenuItem href={`/${locale}/apps/ecommerce/products/request/pending`}>{dictionary['navigation'].pendingRequests}</MenuItem>
            <MenuItem href={`/${locale}/apps/ecommerce/products/request/approved`}>{dictionary['navigation'].approvedRequests}</MenuItem>
            <MenuItem href={`/${locale}/apps/ecommerce/products/request/rejected`}>{dictionary['navigation'].rejectRequests}</MenuItem>
          </SubMenu>
          <SubMenu label={dictionary['navigation'].products} icon={<i className='tabler-basket' />}>
            <MenuItem href={`/${locale}/apps/ecommerce/products/real`}>{dictionary['navigation'].realProducts}</MenuItem>
            <MenuItem href={`/${locale}/apps/ecommerce/products/fake`}>{dictionary['navigation'].fakeProducts}</MenuItem>
          </SubMenu>
          <SubMenu label={dictionary['navigation'].reels} icon={<i className='tabler-movie' />}>
            <MenuItem href={`/${locale}/apps/reels/real`}>{dictionary['navigation'].realReels}</MenuItem>
            <MenuItem href={`/${locale}/apps/reels/fake`}>{dictionary['navigation'].fakeReels}</MenuItem>
          </SubMenu>
        </MenuSection>

        <MenuSection label={dictionary['navigation'].reportManagement}>
          <MenuItem href={`/${locale}/apps/report/reels-report`} icon={<i className='tabler-report' />}>
            {dictionary['navigation'].reelsReport}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/report/report-reason`} icon={<i className='tabler-alert-circle' />}>
            {dictionary['navigation'].reportReason}
          </MenuItem>
        </MenuSection>

        <MenuSection label={dictionary['navigation'].orderAndSeller}>
          <SubMenu label={dictionary['navigation'].seller} icon={<i className='tabler-building-store' />}>
            <MenuItem href={`/${locale}/apps/seller/request`}>{dictionary['navigation'].pendingRequest}</MenuItem>
            <MenuItem href={`/${locale}/apps/seller/real`}>{dictionary['navigation'].realSeller}</MenuItem>
            <MenuItem href={`/${locale}/apps/seller/fake`}>{dictionary['navigation'].fakeSeller}</MenuItem>
          </SubMenu>
          <MenuItem
            href={`/${locale}/apps/seller/live`}
            icon={<i className='tabler-broadcast' />}
            exactMatch={false}
            activeUrl='/apps/seller/live'
          >
            {dictionary['navigation'].liveSeller}
          </MenuItem>
          <MenuItem
            href={`/${locale}/apps/ecommerce/orders/list`}
            icon={<i className='tabler-shopping-cart' />}
            exactMatch={false}
            activeUrl='/apps/ecommerce/orders'
          >
            {dictionary['navigation'].orders}
          </MenuItem>
        </MenuSection>

        <MenuSection label={dictionary['navigation'].userManagement}>
          <MenuItem href={`/${locale}/apps/user/list`} icon={<i className='tabler-user' />}>
            {dictionary['navigation'].user}
          </MenuItem>
        </MenuSection>

        <MenuSection label={dictionary['navigation'].finance}>
          <MenuItem href={`/${locale}/apps/finance/seller-withdrawal`} icon={<i className='tabler-wallet' />}>
            {dictionary['navigation'].sellerWithdrawal || 'Seller Withdrawal'}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/finance/admin-earning`} icon={<i className='tabler-credit-card' />}>
            {dictionary['navigation'].adminEarning || 'Admin Earning'}
          </MenuItem>
        </MenuSection>

        <MenuSection label={dictionary['navigation'].helpAndSettings || 'HELP & SETTINGS'}>
          <MenuItem href={`/${locale}/pages/faq`} icon={<i className='tabler-help-circle' />}>
            {dictionary['navigation'].faq}
          </MenuItem>
          <SubMenu label={dictionary['navigation'].setting || 'Setting'} icon={<i className='tabler-settings' />}>
            <MenuItem href={`/${locale}/apps/settings/app-setting`}>App Setting</MenuItem>
            <MenuItem href={`/${locale}/apps/settings/payment-setting`}>Payment Setting</MenuItem>
            <MenuItem href={`/${locale}/apps/settings/withdraw-setting`}>Withdraw Setting</MenuItem>
            <MenuItem href={`/${locale}/apps/settings/bank-setting`}>Bank Setting</MenuItem>
            <MenuItem href={`/${locale}/apps/settings/currency-setting`}>Currency Setting</MenuItem>
            <MenuItem href={`/${locale}/apps/settings/other-setting`}>Other Setting</MenuItem>
          </SubMenu>
          <MenuItem href={`/${locale}/pages/admin-profile`} icon={<i className='tabler-user' />}>
            {dictionary['navigation'].profile || 'Profile'}
          </MenuItem>
          <MenuItem 
            icon={<i className='tabler-logout' />}
            onClick={async e => {
              e.preventDefault()
              localStorage.removeItem('token')
              await signOut({ callbackUrl: '/login' })
            }}
          >
            {dictionary['navigation'].logout || 'Logout'}
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
