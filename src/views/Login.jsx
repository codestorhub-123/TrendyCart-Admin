'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { email, object, minLength, string, pipe, nonEmpty } from 'valibot'
import classnames from 'classnames'
import { toast } from 'react-hot-toast'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'


// Toast Imports
// deleted toast import from here

// Service Imports
import { login } from '@/services/login'
import { forgotPassword } from '@/services/adminService'

// Styled Custom Components
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const schema = object({
  email: pipe(string(), minLength(1, 'This field is required'), email('Email is invalid')),
  password: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(5, 'Password must be at least 5 characters long')
  )
})

const Login = ({ mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [errorState, setErrorState] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const [viewMode, setViewMode] = useState('login') // 'login' or 'forgot-password'
  
  // Forgot Password Form
  const {
      control: forgotPasswordControl,
      handleSubmit: handleForgotPasswordSubmit,
      formState: { errors: forgotPasswordErrors }
  } = useForm({
      defaultValues: {
          email: ''
      }
  })

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'
  
  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // ... existing illustrations ...
  
  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit = async data => {
    setIsLoading(true)
    setErrorState(null)
    
    // ... existing login logic ...
    try {
      const { ok, result } = await login(data.email, data.password)
      const res = { ok } 

      if (res.ok && result.success) {
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('admin', JSON.stringify(result.data.admin))

        const redirectURL = searchParams.get('redirectTo') ?? themeConfig.homePageUrl
        const currentLocale = locale || 'en'
        
        const finalUrl = redirectURL.startsWith(`/${currentLocale}`)
          ? redirectURL
          : `/${currentLocale}${redirectURL}`

        window.location.href = finalUrl
      } else {
        setErrorState({ message: [result.message || 'Invalid email or password'] })
      }
    } catch (err) {
      setErrorState({ message: ['Something went wrong. Please try again.'] })
    } finally {
      setIsLoading(false)
    }
  }

  const onForgotPasswordSubmit = async (data) => {
    setIsLoading(true)

    try {
        const res = await forgotPassword(data.email)

        if (res.status) {
            toast.success(res.message || 'Temporary password sent to your email')
            setViewMode('login')
        } else {
            toast.error(res.message || 'Failed to send temporary password')
        }
    } catch (error) {
        toast.error('An error occurred')
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <LoginIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && <MaskImg alt='mask' src={authBackground} />}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          
          {viewMode === 'login' ? (
              <>
                <div className='flex flex-col gap-1'>
                  <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}! 👋🏻`}</Typography>
                  <Typography>Please sign-in to your admin account</Typography>
                </div>
                {errorState && <Alert severity='error'>{errorState.message[0]}</Alert>}
                <form
                  noValidate
                  autoComplete='off'
                  action={() => {}}
                  onSubmit={handleSubmit(onSubmit)}
                  className='flex flex-col gap-6'
                >
                  <Controller
                    name='email'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        autoFocus
                        fullWidth
                        type='email'
                        label='Email'
                        placeholder='Enter your email'
                        onChange={e => {
                          field.onChange(e.target.value)
                          errorState !== null && setErrorState(null)
                        }}
                        {...(errors.email && {
                          error: true,
                          helperText: errors?.email?.message
                        })}
                      />
                    )}
                  />
                  <div>
                    <Controller
                        name='password'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                        <CustomTextField
                            {...field}
                            fullWidth
                            label='Password'
                            placeholder='············'
                            id='login-password'
                            type={isPasswordShown ? 'text' : 'password'}
                            onChange={e => {
                            field.onChange(e.target.value)
                            errorState !== null && setErrorState(null)
                            }}
                            slotProps={{
                            input: {
                                endAdornment: (
                                <InputAdornment position='end'>
                                    <IconButton
                                    edge='end'
                                    onClick={handleClickShowPassword}
                                    onMouseDown={e => e.preventDefault()}
                                    >
                                    <i className={isPasswordShown ? 'tabler-eye' : 'tabler-eye-off'} />
                                    </IconButton>
                                </InputAdornment>
                                )
                            }
                            }}
                            {...(errors.password && { error: true, helperText: errors.password.message })}
                        />
                        )}
                    />
                    <div className='flex justify-end mt-2'>
                        <Typography 
                            variant='body2' 
                            className='cursor-pointer text-primary' 
                            onClick={() => setViewMode('forgot-password')}
                        >
                            Forgot Password?
                        </Typography>
                    </div>
                  </div>
                  <Button fullWidth variant='contained' type='submit' disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} color='inherit' /> : 'Login'}
                  </Button>
                </form>
              </>
          ) : (
              <>
                <div className='flex flex-col gap-1 text-center'>
                    <Typography variant='h6' color='text.secondary'>Welcome back !!!</Typography>
                    <Typography variant='h3' className='font-bold mb-4'>Forgot Password</Typography>
                </div>
                <form
                    noValidate
                    autoComplete='off'
                    onSubmit={handleForgotPasswordSubmit(onForgotPasswordSubmit)}
                    className='flex flex-col gap-6'
                >
                    <Controller
                        name='email'
                        control={forgotPasswordControl}
                        rules={{ required: true, pattern: /^[^@\s]+@[^@\s]+\.[^@\s]+$/ }}
                        render={({ field }) => (
                            <CustomTextField
                                {...field}
                                autoFocus
                                fullWidth
                                type='email'
                                label='Email'
                                placeholder='Enter your email'
                                {...(forgotPasswordErrors.email && {
                                    error: true,
                                    helperText: 'Please enter a valid email'
                                })}
                            />
                        )}
                    />
                    <Button fullWidth variant='contained' type='submit' disabled={isLoading}>
                        {isLoading ? <CircularProgress size={24} color='inherit' /> : 'Send'}
                    </Button>
                    <div className='flex justify-center'>
                        <Typography 
                            variant='body2' 
                            className='cursor-pointer text-primary'
                            onClick={() => setViewMode('login')}
                        >
                            Take me back to login!
                        </Typography>
                    </div>
                </form>
              </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
