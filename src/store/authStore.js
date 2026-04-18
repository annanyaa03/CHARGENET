import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        
        const user = data.user
        const role = user?.user_metadata?.role || 'driver'
        
        set({
          user: {
            id: user?.id,
            email: user?.email,
            name: user?.user_metadata?.full_name || user?.email,
            role,
            ...user?.user_metadata
          },
          role,
          token: data.session?.access_token,
          isAuthenticated: true,
        })
        return user
      },

      register: async (formData) => {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: formData.role || 'driver',
              ev_model: formData.evModel || null
            }
          }
        })
        if (error) throw error
        
        const user = data.user
        const role = user?.user_metadata?.role || 'driver'

        set({
          user: {
            id: user?.id,
            email: user?.email,
            name: user?.user_metadata?.full_name || user?.email,
            role,
            ...user?.user_metadata
          },
          role,
          token: data.session?.access_token,
          isAuthenticated: true,
        })
        return user
      },

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, role: null, token: null, isAuthenticated: false })
      },

      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }))
      },

      toggleSavedStation: (stationId) => {
        set((state) => {
          const saved = state.user?.savedStations || []
          const updated = saved.includes(stationId)
            ? saved.filter((id) => id !== stationId)
            : [...saved, stationId]
          return { user: { ...state.user, savedStations: updated } }
        })
      },
    }),
    { name: 'chargenet-auth' }
  )
)
