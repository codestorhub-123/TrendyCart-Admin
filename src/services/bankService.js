import { getApiBase, getHeaders } from '@/utils/getApiBase'

const getJsonHeaders = () => {
    return {
        ...getHeaders(),
        'Content-Type': 'application/json'
    }
}

// Create bank
export const createBank = async (data) => {
    const url = `${getApiBase()}/admin/bank/create`
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: getJsonHeaders(),
            body: JSON.stringify(data)
        })
        return res.json()
    } catch (error) {
        console.error('bankService: createBank failed:', error)
        return { status: false, message: error.message }
    }
}

// Update bank
export const updateBank = async (bankId, data) => {
    const url = `${getApiBase()}/admin/bank/update?bankId=${bankId}`
    try {
        const res = await fetch(url, {
            method: 'PATCH',
            headers: getJsonHeaders(),
            body: JSON.stringify(data)
        })
        return res.json()
    } catch (error) {
        console.error('bankService: updateBank failed:', error)
        return { status: false, message: error.message }
    }
}

// Get all banks
export const getBanks = async () => {
    const url = `${getApiBase()}/admin/bank/getBanks`
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: getJsonHeaders()
        })
        return res.json()
    } catch (error) {
        console.error('bankService: getBanks failed:', error)
        return { status: false, message: error.message }
    }
}

// Delete bank
export const deleteBank = async (bankId) => {
    const url = `${getApiBase()}/admin/bank/delete?bankId=${bankId}`
    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: getJsonHeaders()
        })
        return res.json()
    } catch (error) {
        console.error('bankService: deleteBank failed:', error)
        return { status: false, message: error.message }
    }
}
