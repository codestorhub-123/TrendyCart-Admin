'use client'

import { useState, useEffect, useRef } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import CustomTextField from '@core/components/mui/TextField'
import { toast } from 'react-hot-toast'

import { getProfile, updateProfile, updateImage, updatePassword } from '@/services/adminService'
import { getImageUrl } from '@/utils/imageUrl'

const AdminProfile = () => {
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        image: ''
    })
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    })
    const [previewImage, setPreviewImage] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isProfileLoading, setIsProfileLoading] = useState(false)
    const [isPasswordLoading, setIsPasswordLoading] = useState(false)
    const [isImageLoading, setIsImageLoading] = useState(false)
    
    const fileInputRef = useRef(null)

    const fetchProfile = async () => {
        setIsLoading(true)
        const res = await getProfile()
        if (res && res.status === true) {
            const data = res.data || res.admin || res.user || {}
            setProfileData({
                username: data.username || '',
                email: data.email || '',
                image: data.image || ''
            })
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const handleProfileChange = (field, value) => {
        setProfileData(prev => ({ ...prev, [field]: value }))
    }

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({ ...prev, [field]: value }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            setPreviewImage(URL.createObjectURL(file))
        }
    }

    const handleUpdateProfile = async () => {
        setIsProfileLoading(true)
        const res = await updateProfile({
            username: profileData.username,
            email: profileData.email
        })
        if (res && res.status === true) {
            toast.success(res.message || 'Profile updated successfully')
        } else {
            toast.error(res.message || 'Failed to update profile')
        }
        setIsProfileLoading(false)
    }

    const handleUpdateImage = async () => {
        if (!selectedFile) return

        setIsImageLoading(true)
        const formData = new FormData()
        formData.append('image', selectedFile)

        const res = await updateImage(formData)
        if (res && res.status === true) {
            toast.success(res.message || 'Image updated successfully')
            
            // Clear local preview states
            setSelectedFile(null)
            setPreviewImage(null)
            if (fileInputRef.current) fileInputRef.current.value = ''

            // Re-fetch profile data to be sure
            await fetchProfile()

            // Dispatch event for other components (like UserDropdown)
            window.dispatchEvent(new Event('user-profile-updated'))
        } else {
            toast.error(res.message || 'Failed to update image')
        }
        setIsImageLoading(false)
    }

    const handleUpdatePassword = async () => {
        if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
            toast.error('All password fields are required')
            return
        }
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            toast.error('New passwords do not match')
            return
        }
        if (passwordData.newPassword.length < 6) {
             toast.error('Password must be at least 6 characters')
             return
        }

        setIsPasswordLoading(true)
        const res = await updatePassword({
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword
        })

        if (res && res.status === true) {
            toast.success(res.message || 'Password updated successfully')
            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            })
        } else {
            toast.error(res.message || 'Failed to update password')
        }
        setIsPasswordLoading(false)
    }

    const handleResetPasswordForm = () => {
        setPasswordData({
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        })
    }

    if (isLoading) return <Typography>Loading...</Typography>

    return (
        <div className='flex flex-col gap-6'>
            <Typography variant='h5'>ADMIN</Typography>
            <Grid container spacing={6}>
                {/* Left Column - Profile Image */}
                <Grid item xs={12} md={5} lg={4}>
                    <Card>
                        <CardContent className='flex flex-col items-center gap-6'>
                            <div className='w-32 h-32 rounded-full border overflow-hidden relative'>
                                <img 
                                    src={previewImage || getImageUrl(profileData.image) || '/images/avatars/1.png'} 
                                    alt="Profile" 
                                    className='w-full h-full object-cover'
                                />
                                {selectedFile && <div className='absolute inset-0 bg-black/20' />}
                            </div>
                            
                            <div className='text-center'>
                                <Typography variant='h6'>{profileData.username}</Typography>
                                <Typography variant='body2' color='text.secondary'>{profileData.email}</Typography>
                            </div>

                            <input 
                                type='file' 
                                hidden 
                                ref={fileInputRef} 
                                accept='image/*' 
                                onChange={handleImageChange} 
                            />
                            
                            {selectedFile ? (
                                <div className='flex gap-2 w-full'>
                                     <Button 
                                        fullWidth 
                                        variant='contained' 
                                        onClick={handleUpdateImage}
                                        disabled={isImageLoading}
                                    >
                                        {isImageLoading ? 'Uploading...' : 'Save Image'}
                                    </Button>
                                    <Button 
                                        variant='tonal' 
                                        color='secondary'
                                        onClick={() => {
                                            setSelectedFile(null)
                                            setPreviewImage(null)
                                            fileInputRef.current.value = ''
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    fullWidth 
                                    variant='contained' 
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    UPLOAD IMAGE
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Forms */}
                <Grid item xs={12} md={7} lg={8}>
                    <div className='flex flex-col gap-6'>
                        {/* Personal Information */}
                        <Card>
                            <CardHeader title='PERSONAL INFORMATION' titleTypographyProps={{ className: 'text-white font-bold flex items-center gap-2' }} avatar={<i className='tabler-user text-white' />} />
                            <CardContent className='flex flex-col gap-4'>
                                <div className='flex flex-col gap-1'>
                                    <Typography variant='caption'>Name</Typography>
                                    <CustomTextField 
                                        fullWidth 
                                        value={profileData.username} 
                                        onChange={e => handleProfileChange('username', e.target.value)}
                                    />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <Typography variant='caption'>Email Address</Typography>
                                    <CustomTextField 
                                        fullWidth 
                                        value={profileData.email} 
                                        onChange={e => handleProfileChange('email', e.target.value)}
                                    />
                                </div>
                                <div className='flex justify-end mt-2'>
                                    <Button 
                                        variant='contained' 
                                        onClick={handleUpdateProfile} 
                                        disabled={isProfileLoading}
                                    >
                                        {isProfileLoading ? 'Saving...' : 'Submit'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Change Password */}
                        <Card>
                            <CardHeader title='CHANGE PASSWORD' titleTypographyProps={{ className: 'text-white font-bold flex items-center gap-2' }} avatar={<i className='tabler-refresh text-white' />} />
                            <CardContent className='flex flex-col gap-4'>
                                <div className='flex flex-col gap-1'>
                                    <Typography variant='caption'>Current Password</Typography>
                                    <CustomTextField 
                                        fullWidth 
                                        type='password'
                                        placeholder='Current Password'
                                        value={passwordData.oldPassword} 
                                        onChange={e => handlePasswordChange('oldPassword', e.target.value)}
                                    />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <Typography variant='caption'>New Password</Typography>
                                    <CustomTextField 
                                        fullWidth 
                                        type='password'
                                        value={passwordData.newPassword} 
                                        onChange={e => handlePasswordChange('newPassword', e.target.value)}
                                    />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <Typography variant='caption'>Confirm New Password</Typography>
                                    <CustomTextField 
                                        fullWidth 
                                        type='password'
                                        value={passwordData.confirmNewPassword} 
                                        onChange={e => handlePasswordChange('confirmNewPassword', e.target.value)}
                                    />
                                    <Typography variant='caption' color='text.disabled'>Password must be at least 6 characters</Typography>
                                </div>

                                <div className='flex gap-4 mt-2'>
                                    <Button 
                                        variant='contained' 
                                        onClick={handleUpdatePassword}
                                        disabled={isPasswordLoading}
                                    >
                                        {isPasswordLoading ? 'Updating...' : 'Update Password'}
                                    </Button>
                                    <Button 
                                        variant='tonal' 
                                        color='secondary'
                                        onClick={handleResetPasswordForm}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </Grid>
            </Grid>
        </div>
    )
}

export default AdminProfile
