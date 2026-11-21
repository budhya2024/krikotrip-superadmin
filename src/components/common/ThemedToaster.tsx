import { Toaster } from 'sonner'
import { useTheme } from '../../context/ThemeContext'

export const ThemedToaster = () => {
  const { theme } = useTheme()
  return <Toaster theme={theme} richColors position="top-right" />
}
