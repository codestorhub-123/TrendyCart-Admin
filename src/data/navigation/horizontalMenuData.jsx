const horizontalMenuData = dictionary => [
  // Dashboard
  {
    label: dictionary['navigation'].dashboards,
    icon: 'tabler-smart-home',
    href: '/dashboards/crm'
  },
  {
    label: dictionary['navigation'].productManagement,
    icon: 'tabler-package',
    children: [
      {
        label: dictionary['navigation'].attribute,
        icon: 'tabler-key',
        href: '/apps/ecommerce/products/attribute'
      },
      {
        label: dictionary['navigation'].category,
        icon: 'tabler-category',
        href: '/apps/ecommerce/products/category'
      },
      {
        label: dictionary['navigation'].promoCode,
        icon: 'tabler-percentage',
        href: '/apps/ecommerce/promo-code'
      },
      {
        label: dictionary['navigation'].productRequest,
        icon: 'tabler-shopping-cart-check',
        children: [
          {
            label: dictionary['navigation'].pendingRequests,
            href: '/apps/ecommerce/products/request/pending'
          },
          {
            label: dictionary['navigation'].approvedRequests,
            href: '/apps/ecommerce/products/request/approved'
          },
          {
            label: dictionary['navigation'].rejectRequests,
            href: '/apps/ecommerce/products/request/rejected'
          }
        ]
      },
      {
        label: dictionary['navigation'].products,
        icon: 'tabler-basket',
        children: [
          {
            label: dictionary['navigation'].realProducts,
            href: '/apps/ecommerce/products/real'
          },
          {
            label: dictionary['navigation'].fakeProducts,
            href: '/apps/ecommerce/products/fake'
          }
        ]
      },
      {
        label: dictionary['navigation'].reels,
        icon: 'tabler-movie',
        children: [
          {
            label: dictionary['navigation'].realReels,
            href: '/apps/reels/real'
          },
          {
            label: dictionary['navigation'].fakeReels,
            href: '/apps/reels/fake'
          }
        ]
      }
    ]
  },
  {
    label: dictionary['navigation'].reportManagement,
    icon: 'tabler-report-analytics',
    children: [
      {
        label: dictionary['navigation'].reelsReport,
        icon: 'tabler-report',
        href: '/apps/report/reels-report'
      },
      {
        label: dictionary['navigation'].reportReason,
        icon: 'tabler-alert-circle',
        href: '/apps/report/report-reason'
      }
    ]
  },
  {
    label: dictionary['navigation'].seller,
    icon: 'tabler-building-store',
    children: [
      {
        label: dictionary['navigation'].pendingRequest,
        href: '/apps/seller/request'
      },
      {
        label: dictionary['navigation'].realSeller,
        href: '/apps/seller/real'
      },
      {
        label: dictionary['navigation'].fakeSeller,
        href: '/apps/seller/fake'
      }
    ]
  },
  {
    label: dictionary['navigation'].liveSeller,
    icon: 'tabler-broadcast',
    href: '/apps/seller/live'
  },
  {
    label: dictionary['navigation'].orders,
    icon: 'tabler-shopping-cart',
    href: '/apps/ecommerce/orders/list'
  },
  {
    label: dictionary['navigation'].userManagement,
    icon: 'tabler-users',
    children: [
      {
        label: dictionary['navigation'].user,
        icon: 'tabler-user',
        href: '/apps/user/list'
      }
    ]
  },
  {
    label: dictionary['navigation'].finance,
    icon: 'tabler-settings',
    children: [
      {
        label: dictionary['navigation'].sellerWithdrawal || 'Seller Withdrawal',
        icon: 'tabler-wallet',
        href: '/apps/finance/seller-withdrawal'
      },
      {
        label: dictionary['navigation'].adminEarning || 'Admin Earning',
        icon: 'tabler-credit-card',
        href: '/apps/finance/admin-earning'
      }
    ]
  },
  {
    label: dictionary['navigation'].helpAndSettings || 'HELP & SETTINGS',
    icon: 'tabler-lifebuoy',
    children: [
      {
        label: dictionary['navigation'].faq,
        icon: 'tabler-help-circle',
        href: '/pages/faq'
      },
      {
        label: dictionary['navigation'].setting || 'Setting',
        icon: 'tabler-settings',
        children: [
          {
            label: 'App Setting',
            href: '/apps/settings/app-setting'
          },
          {
            label: 'Payment Setting',
            href: '/apps/settings/payment-setting'
          },
          {
            label: 'Withdraw Setting',
            href: '/apps/settings/withdraw-setting'
          },
          {
            label: 'Bank Setting',
            href: '/apps/settings/bank-setting'
          },
          {
            label: 'Currency Setting',
            href: '/apps/settings/currency-setting'
          },
          {
            label: 'Other Setting',
            href: '/apps/settings/other-setting'
          }
        ]
      },
      {
        label: dictionary['navigation'].profile || 'Profile',
        icon: 'tabler-user',
        href:  '/pages/admin-profile'
      },
      {
        label: dictionary['navigation'].logout || 'Logout',
        icon: 'tabler-logout',
        href: '/login'
      }
    ]
  }
]

export default horizontalMenuData


