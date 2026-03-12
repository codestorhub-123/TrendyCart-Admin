'use client'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import TrendyCartLogo from '@core/svg/Logo'
import TrendyCartFavicon from '@core/svg/Favicon'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

const Logo = () => {
  // Hooks
  const { isHovered, isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()

  // Vars
  const { layout } = settings

  // Determine if we should show the full logo or just the favicon
  // isLogoTextHidden is true when the sidebar is collapsed and not hovered
  const isLogoTextHidden = !isBreakpointReached && layout === 'collapsed' && !isHovered

  return (
    <div className='flex items-center gap-3'>
      {isLogoTextHidden ? (
        <TrendyCartFavicon className='transition-all duration-300' />
      ) : (
        <TrendyCartLogo className='transition-all duration-300' />
      )}
    </div>
  )
}

export default Logo
