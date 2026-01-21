import { getApiBase, getHeaders } from '@/utils/getApiBase'

const getJsonHeaders = () => {
  return {
    ...getHeaders(),
    'Content-Type': 'application/json'
  }
}

// Get all settings
export const getSetting = async () => {
  const url = `${getApiBase()}/admin/setting`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('settingService: getSetting failed:', error)
    return { status: false, message: error.message }
  }
}

// Update setting fields
export const updateSetting = async (settingId, data) => {
  const url = `${getApiBase()}/admin/setting/update?settingId=${settingId}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  } catch (error) {
    console.error('settingService: updateSetting failed:', error)
    return { status: false, message: error.message }
  }
}

// Toggle boolean settings
export const handleSwitch = async (settingId, type) => {
  const url = `${getApiBase()}/admin/setting/handleSwitch?settingId=${settingId}&type=${type}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('settingService: handleSwitch failed:', error)
    return { status: false, message: error.message }
  }
}

// Toggle nested document fields
export const handleFieldSwitch = async (settingId, field, toggleType) => {
  const url = `${getApiBase()}/admin/setting/handleFieldSwitch?settingId=${settingId}&field=${field}&toggleType=${toggleType}`
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: getJsonHeaders()
    })
    return res.json()
  } catch (error) {
    console.error('settingService: handleFieldSwitch failed:', error)
    return { status: false, message: error.message }
  }
}
