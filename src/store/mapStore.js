import { create } from 'zustand'

export const useMapStore = create((set) => ({
  selectedStation: null,
  filters: {
    plugType: 'all',
    network: 'all',
    speed: 'all',
    availability: 'all',
  },
  mapCenter: [20.5937, 78.9629],
  mapZoom: 5,

  setSelectedStation: (station) => set({ selectedStation: station }),
  clearSelectedStation: () => set({ selectedStation: null }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () =>
    set({
      filters: { plugType: 'all', network: 'all', speed: 'all', availability: 'all' },
    }),

  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
}))
