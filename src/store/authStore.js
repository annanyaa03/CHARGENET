import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const mockUsers = [
  {
    id: 'usr-001',
    name: 'Arjun Sharma',
    email: 'driver@chargenet.in',
    password: 'password123',
    role: 'driver',
    evModel: 'Tata Nexon EV',
    avatar: null,
    walletBalance: 1250,
    savedStations: ['stn-001', 'stn-005'],
  },
  {
    id: 'usr-002',
    name: 'Priya Mehta',
    email: 'owner@chargenet.in',
    password: 'password123',
    role: 'owner',
    evModel: null,
    avatar: null,
    walletBalance: 0,
    savedStations: [],
  },
  {
    id: 'usr-003',
    name: 'Rahul Admin',
    email: 'admin@chargenet.in',
    password: 'password123',
    role: 'admin',
    evModel: null,
    avatar: null,
    walletBalance: 0,
    savedStations: [],
  },
]

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      token: null,
      isAuthenticated: false,

      login: (email, password) => {
        const found = mockUsers.find(
          (u) => u.email === email && u.password === password
        )
        if (!found) throw new Error('Invalid email or password')
        const { password: _pw, ...userWithoutPassword } = found
        set({
          user: userWithoutPassword,
          role: found.role,
          token: 'mock-token-' + found.id,
          isAuthenticated: true,
        })
        return userWithoutPassword
      },

      register: (data) => {
        const newUser = {
          id: 'usr-' + Date.now(),
          name: data.name,
          email: data.email,
          role: data.role || 'driver',
          evModel: data.evModel || null,
          avatar: null,
          walletBalance: 0,
          savedStations: [],
        }
        set({
          user: newUser,
          role: newUser.role,
          token: 'mock-token-' + newUser.id,
          isAuthenticated: true,
        })
        return newUser
      },

      logout: () => {
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
