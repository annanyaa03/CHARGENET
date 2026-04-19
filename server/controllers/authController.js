import { authService } from '../services/supabase.js'

export const authController = {

  signup: async (req, res) => {
    const { email, password, full_name } = 
      req.body
    
    const data = await authService
      .signup(email, password, full_name)
    
    res.status(201).json({
      success: true,
      data: {
        user: data.user,
        message: 'Check email to verify account'
      },
      timestamp: new Date().toISOString()
    })
  },

  login: async (req, res) => {
    const { email, password } = req.body
    
    const data = await authService
      .login(email, password)
    
    res.json({
      success: true,
      data: {
        user: data.user,
        access_token: 
          data.session.access_token,
        expires_at: 
          data.session.expires_at
      },
      timestamp: new Date().toISOString()
    })
  },

  logout: async (req, res) => {
    await authService.logout()
    
    res.json({
      success: true,
      data: { 
        message: 'Logged out successfully' 
      },
      timestamp: new Date().toISOString()
    })
  }
}
