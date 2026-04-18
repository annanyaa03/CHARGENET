import { AppRouter } from './routes/AppRouter'
import ErrorBoundary from './components/ErrorBoundary'
import { Toaster } from 'react-hot-toast'

export function App() {
  return (
    <ErrorBoundary>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#111827',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '0px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
      <AppRouter />
    </ErrorBoundary>
  )
}
