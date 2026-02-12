'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

// Third-party Imports
import classnames from 'classnames'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import { toast } from 'react-hot-toast'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'
import CustomTextField from '@core/components/mui/TextField'

// Service Imports
import { getSetting, updateSetting } from '@/services/settingService'

// Style Imports
import '@/libs/styles/tiptapEditor.css'

const EditorToolbar = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <div className='flex flex-wrap gap-x-3 gap-y-1 pbs-6 pbe-4 pli-6'>
      <CustomIconButton
        {...(editor.isActive('bold') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <i className={classnames('tabler-bold', { 'text-textSecondary': !editor.isActive('bold') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('underline') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <i className={classnames('tabler-underline', { 'text-textSecondary': !editor.isActive('underline') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('italic') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i className={classnames('tabler-italic', { 'text-textSecondary': !editor.isActive('italic') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('strike') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <i className={classnames('tabler-strikethrough', { 'text-textSecondary': !editor.isActive('strike') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'left' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <i
          className={classnames('tabler-align-left', { 'text-textSecondary': !editor.isActive({ textAlign: 'left' }) })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'center' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <i
          className={classnames('tabler-align-center', {
            'text-textSecondary': !editor.isActive({ textAlign: 'center' })
          })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'right' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <i
          className={classnames('tabler-align-right', {
            'text-textSecondary': !editor.isActive({ textAlign: 'right' })
          })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'justify' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <i
          className={classnames('tabler-align-justified', {
            'text-textSecondary': !editor.isActive({ textAlign: 'justify' })
          })}
        />
      </CustomIconButton>
    </div>
  )
}

const RichTextEditor = ({ content, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Write something here...'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline
    ],
    content: content,
    onUpdate: ({ editor }) => {
        onChange(editor.getHTML())
    },
    immediatelyRender: false
  })

  // Update editor content when content prop changes remotely (initial load)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
        // Avoid re-setting cursor position if editing, but for initial load it's fine
        // This check is simple and might need refinement for real-time collab, but fine here
        if(editor.getText() === '' && content !== '<p></p>') {
             editor.commands.setContent(content)
        }
    }
  }, [content, editor])

  return (
    <Card className='p-0 border shadow-none'>
        <CardContent className='p-0'>
        <EditorToolbar editor={editor} />
        <Divider className='mli-6' />
        <EditorContent editor={editor} className='bs-[200px] overflow-y-auto flex ' />
        </CardContent>
    </Card>
  )
}

const OtherSetting = () => {
  const [activeTab, setActiveTab] = useState('privacy')
  const [settingData, setSettingData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  // Form States
  const [privacyText, setPrivacyText] = useState('')
  const [privacyLink, setPrivacyLink] = useState('')
  const [termsText, setTermsText] = useState('')
  const [termsLink, setTermsLink] = useState('')

  const fetchSettings = async () => {
    setIsLoading(true)
    const res = await getSetting()
    if (res && res.status === true && res.setting) {
      setSettingData(res.setting)
      setPrivacyText(res.setting.privacyPolicyText || '')
      setPrivacyLink(res.setting.privacyPolicyLink || '')
      // Check if terms properties exist, if not default to empty
      setTermsText(res.setting.termsConditionText || '') 
      setTermsLink(res.setting.termsAndConditionsLink || '')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleSubmit = async () => {
    if (!settingData) return
    setIsSubmitLoading(true)

    const payload = {
        ...settingData, // keep existing data
        privacyPolicyText: privacyText,
        privacyPolicyLink: privacyLink,
        termsConditionText: termsText, // Assuming this is the key
        termsAndConditionsLink: termsLink
    }

    // Clean up payload - sometimes we don't want to send back everything
    // But updateSetting usually merges or replaces. 
    // Based on settingService, it callsPATCH /admin/setting/update
    
    // Create a specific object for update to avoid sending read-only id or timestamps if needed
    // But usually backend handles. Let's send specific fields to be safe.
    const updatePayload = {
        privacyPolicyText: privacyText,
        privacyPolicyLink: privacyLink,
        termsAndConditionsText: termsText,
        termsAndConditionsLink: termsLink,
        adminCommissionCharges: settingData?.commissionPercent || 0,
        cancelOrderCharges: settingData?.cancelOrderCharges || 0,
        withdrawCharges: settingData?.withdrawCharges || 0,
        withdrawLimit: settingData?.withdrawLimit || 0,
        minPayout: settingData?.minValueForWithdrawal || 0
    }

    const res = await updateSetting(settingData._id, updatePayload)

    if (res && res.status === true) {
        toast.success(res.message || 'Settings updated successfully')
        if (res.setting) {
             setSettingData(res.setting)
        }
    } else {
        toast.error(res.message || 'Failed to update settings')
    }
    setIsSubmitLoading(false)
  }

  if (isLoading) return <Typography>Loading...</Typography>

  return (
    <Card>
      <TabContext value={activeTab}>
        <div className='flex border-b pl-6'>
            <TabList onChange={handleTabChange} aria-label='other settings tabs'>
                <Tab label='Privacy policy' value='privacy' />
                <Tab label='Terms and condition' value='terms' />
            </TabList>
        </div>

        <TabPanel value='privacy' className='p-6'>
             <Typography variant='h5' className='mb-6'>Privacy Policy:</Typography>
             <div className='mb-12'>
                <RichTextEditor 
                    content={privacyText} 
                    onChange={setPrivacyText} 
                    placeholder="Enter Privacy Policy content..." 
                />
             </div>
             <CustomTextField 
                label='Privacy Policy Link' 
                fullWidth 
                value={privacyLink} 
                onChange={(e) => setPrivacyLink(e.target.value)} 
                placeholder='https://...'
             />
        </TabPanel>

        <TabPanel value='terms' className='p-6'>
             <Typography variant='h5' className='mb-6'>Terms and Conditions:</Typography>
             <div className='mb-12'>
                <RichTextEditor 
                    content={termsText} 
                    onChange={setTermsText} 
                    placeholder="Enter Terms and Conditions content..." 
                />
             </div>
             <CustomTextField 
                label='Terms and Condition Link' 
                fullWidth 
                value={termsLink} 
                onChange={(e) => setTermsLink(e.target.value)} 
                placeholder='https://...'
             />
        </TabPanel>
      </TabContext>
        
      <div className='flex justify-end p-6'>
          <Button variant='contained' onClick={handleSubmit} disabled={isSubmitLoading}>
            {isSubmitLoading ? 'Saving...' : 'Submit'}
          </Button>
      </div>
    </Card>
  )
}

export default OtherSetting
