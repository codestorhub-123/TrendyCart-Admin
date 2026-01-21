// Next Imports
import { useParams } from 'next/navigation'
import { signOut } from 'next-auth/react'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Component Imports
import HorizontalNav, { Menu, SubMenu, MenuItem } from '@menu/horizontal-menu'
import VerticalNavContent from './VerticalNavContent'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalMenuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ level }) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='tabler-chevron-right' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const HorizontalMenu = ({ dictionary }) => {
  // Hooks
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  const params = useParams()

  // Vars
  const { transitionDuration } = verticalNavOptions
  const { lang: locale } = params

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={VerticalNavContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor: 'var(--mui-palette-background-paper)'
      }}
    >
      <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        menuItemStyles={menuItemStyles(theme, 'tabler-circle')}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 14 : 12),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='tabler-circle text-xs' /> },
          menuSectionStyles: verticalMenuSectionStyles(verticalNavOptions, theme)
        }}
      >
        <MenuItem href={`/${locale}/dashboards/crm`} icon={<i className='tabler-smart-home' />}>
          {dictionary['navigation'].dashboards}
        </MenuItem>
        
        <SubMenu label={dictionary['navigation'].productManagement} icon={<i className='tabler-package' />}>
          <MenuItem href={`/${locale}/apps/ecommerce/products/attribute`} icon={<i className='tabler-key' />}>
            {dictionary['navigation'].attribute}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/ecommerce/products/category`} icon={<i className='tabler-category' />}>
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
        </SubMenu>

        <SubMenu label={dictionary['navigation'].reportManagement} icon={<i className='tabler-report-analytics' />}>
          <MenuItem href={`/${locale}/apps/report/reels-report`} icon={<i className='tabler-report' />}>
            {dictionary['navigation'].reelsReport}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/report/report-reason`} icon={<i className='tabler-alert-circle' />}>
            {dictionary['navigation'].reportReason}
          </MenuItem>
        </SubMenu>

        <SubMenu label={dictionary['navigation'].seller} icon={<i className='tabler-building-store' />}>
            <MenuItem href={`/${locale}/apps/seller/request`}>{dictionary['navigation'].pendingRequest}</MenuItem>
            <MenuItem href={`/${locale}/apps/seller/real`}>{dictionary['navigation'].realSeller}</MenuItem>
            <MenuItem href={`/${locale}/apps/seller/fake`}>{dictionary['navigation'].fakeSeller}</MenuItem>
            <MenuItem
              href={`/${locale}/apps/seller/live`}
              icon={<i className='tabler-broadcast' />}
              exactMatch={false}
              activeUrl='/apps/seller/live'
            >
              {dictionary['navigation'].liveSeller}
            </MenuItem>
        </SubMenu>

        <MenuItem href={`/${locale}/apps/ecommerce/orders/list`} icon={<i className='tabler-shopping-cart' />}>
          {dictionary['navigation'].orders}
        </MenuItem>

        <SubMenu label={dictionary['navigation'].userManagement} icon={<i className='tabler-users' />}>
          <MenuItem href={`/${locale}/apps/user/list`} icon={<i className='tabler-user' />}>
            {dictionary['navigation'].user}
          </MenuItem>
        </SubMenu>

        <SubMenu label={dictionary['navigation'].finance} icon={<i className='tabler-settings' />}>
          <MenuItem href={`/${locale}/apps/finance/seller-withdrawal`} icon={<i className='tabler-wallet' />}>
            {dictionary['navigation'].sellerWithdrawal || 'Seller Withdrawal'}
          </MenuItem>
          <MenuItem href={`/${locale}/apps/finance/admin-earning`} icon={<i className='tabler-credit-card' />}>
            {dictionary['navigation'].adminEarning || 'Admin Earning'}
          </MenuItem>
        </SubMenu>

        <SubMenu label={dictionary['navigation'].helpAndSettings || 'HELP & SETTINGS'} icon={<i className='tabler-lifebuoy' />}>
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
        </SubMenu>
      </Menu>
    </HorizontalNav>
  )
}

export default HorizontalMenu
