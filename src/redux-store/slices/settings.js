import { createSlice } from '@reduxjs/toolkit'

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    currency: '₹' // Default as fallback
  },
  reducers: {
    setCurrency: (state, action) => {
      state.currency = action.payload
    }
  }
})

export const { setCurrency } = settingsSlice.actions

export default settingsSlice.reducer
