// Component Imports
import HostList from '@views/apps/host/list'

// Data Imports
import { getUserData } from '@/app/server/actions'

const HostListApp = async () => {
  // Vars
  const data = await getUserData()

  return <HostList hostData={data} />
}

export default HostListApp

