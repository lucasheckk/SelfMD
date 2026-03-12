import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RoutesConfig } from '../constants/routes.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RoutesConfig />
  </StrictMode>,
)
