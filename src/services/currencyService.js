import { getApiBase, getHeaders } from '@/utils/getApiBase'

const getJsonHeaders = () => {
    return {
        ...getHeaders(),
        'Content-Type': 'application/json'
    }
}

// Create currency
export const createCurrency = async (data) => {
    const url = `${getApiBase()}/admin/currency/storeCurrency`
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: getJsonHeaders(),
            body: JSON.stringify(data)
        })
        return res.json()
    } catch (error) {
        console.error('currencyService: createCurrency failed:', error)
        return { status: false, message: error.message }
    }
}

// Update currency
export const updateCurrency = async (currencyId, data) => {
    const url = `${getApiBase()}/admin/currency/updateCurrency?currencyId=${currencyId}`
    try {
        const res = await fetch(url, {
            method: 'PATCH',
            headers: getJsonHeaders(),
            body: JSON.stringify(data)
        })
        return res.json()
    } catch (error) {
        console.error('currencyService: updateCurrency failed:', error)
        return { status: false, message: error.message }
    }
}

// Delete currency
export const deleteCurrency = async (currencyId) => {
    const url = `${getApiBase()}/admin/currency/deleteCurrency?currencyId=${currencyId}`
    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: getJsonHeaders()
        })
        return res.json()
    } catch (error) {
        console.error('currencyService: deleteCurrency failed:', error)
        return { status: false, message: error.message }
    }
}

// Set default currency
export const setDefaultCurrency = async (currencyId) => {
    const url = `${getApiBase()}/admin/currency/setdefaultCurrency?currencyId=${currencyId}`
    try {
        const res = await fetch(url, {
            method: 'PATCH',
            headers: getJsonHeaders()
        })
        return res.json()
    } catch (error) {
        console.error('currencyService: setDefaultCurrency failed:', error)
        return { status: false, message: error.message }
    }
}

// Fetch all currencies
export const fetchCurrencies = async () => {
    const url = `${getApiBase()}/admin/currency/fetchCurrencies`
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: getJsonHeaders()
        })
        return res.json()
    } catch (error) {
        console.error('currencyService: fetchCurrencies failed:', error)
        return { status: false, message: error.message }
    }
}

// Get default currency
export const getDefaultCurrency = async () => {
    const url = `${getApiBase()}/admin/currency/getDefaultCurrency`
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: getJsonHeaders()
        })
        return res.json()
    } catch (error) {
        console.error('currencyService: getDefaultCurrency failed:', error)
        return { status: false, message: error.message }
    }
}
