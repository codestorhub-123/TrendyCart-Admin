'use client'

// Component Imports
import ProfileDetails from '@/components/profile/ProfileDetails'

const HostDetails = () => {
  // Data mapper function
  const mapHostData = data => {
    return {
      _id: data._id,
      name: data.name,
      firstName: data.name?.split(' ')[0] || data.name,
      lastName: data.name?.split(' ').slice(1).join(' ') || '',
      userName: `@${data.uniqueId}`,
      billingEmail: data.email || '-',
      status: data.status || 'active',
      role: 'Host',
      taxId: data.identity || '-',
      contact: data.countryCode || '-',
      language: data.hostProfile?.languages?.length > 0 ? data.hostProfile.languages : ['English'],
      interests: data.hostProfile?.interests || [],
      country: data.country || '-',
      avatar: data.avatar,
      coins: data.coins,
      followers: data.followers,
      following: data.following,
      isOnline: data.isOnline,
      isBlocked: data.isBlocked,
      loginType: data.loginType,
      age: data.age,
      gender: data.gender,
      bio: data.bio,
      currentLevel: data.currentLevel,
      totalCoinsSpent: data.totalCoinsSpent,
      pendingWithdrwCoins: data.pendingWithdrwCoins || 0,
      withdrawCoins: data.withdrawCoins || 0,
      adsViewCount: data.adsViewCount || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      ...data
    }
  }

  return <ProfileDetails entityType='host' roleLabel='Host' roleColor='primary' dataMapper={mapHostData} />
}

export default HostDetails
