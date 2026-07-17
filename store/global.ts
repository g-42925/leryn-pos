

import { create } from 'zustand'
import { deleteAuthCookie } from '@/app/actions/logout';
import { staffLogoutAction } from '@/app/actions/staff-logout';
import { persist, devtools } from 'zustand/middleware'

export interface GlobalState {
  accountId: string;
  role: string;
  permission: string[],
  branch: string
}

const initialState = {
  accountId: '',
  role: '',
  branch: '',
  permission: []
}

const useGlobalState = create<Global>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        hasHydrated: false,
        logout: async () => {
          set(initialState)
          await deleteAuthCookie()
        },
        staffLogout: async () => {
          await staffLogoutAction()
        },
        adminLogin: (r: GlobalState) => {
          set(() => ({
            ...r,
          }))
        },
        login: (r: GlobalState) => {
          set(() => ({
            ...r,
            role: '',
            branch: '',
            permission: []
          }))
        },
      }),
      {
        name: 'global-storage',
        onRehydrateStorage: () => (state) => {
          if (state) state.hasHydrated = true
        },
      }
    )
  )
)


type Global = GlobalState & {
  hasHydrated: boolean;
  login: (r: GlobalState) => void;
  adminLogin: (r: GlobalState) => void;
  staffLogout: () => void;
  logout: () => void;
}

export default useGlobalState;
