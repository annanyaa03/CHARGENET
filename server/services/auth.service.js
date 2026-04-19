import supabase from '../lib/supabase.js'

export const authService = {

  signup: async (email, password, fullName) => {
    const { data, error } = await 
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })

    if (error) throw error
    return data
  },

  login: async (email, password) => {
    const { data, error } = await 
      supabase.auth.signInWithPassword({
        email,
        password
      })

    if (error) {
      const err = new Error('Invalid credentials')
      err.status = 401
      throw err
    }
    return data
  },

  logout: async () => {
    const { error } = await 
      supabase.auth.signOut()
    if (error) throw error
    return true
  },

  getUser: async (token) => {
    const { data: { user }, error } = 
      await supabase.auth.getUser(token)
    if (error) throw error
    return user
  }
}
