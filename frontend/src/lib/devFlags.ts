export const isDevAuthBypassEnabled =
  import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === 'true'

export const isDevMockDataEnabled =
  import.meta.env.DEV && import.meta.env.VITE_DEV_MOCK_DATA === 'true'
