import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { OnboardingModal } from './components/OnboardingModal'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PracticePage } from './pages/PracticePage'
import { SavedPage } from './pages/SavedPage'
import { SettingsPage } from './pages/SettingsPage'
import { SituationPage } from './pages/SituationPage'
import { AppProvider, useAppState } from './state/AppContext'

function AppRoutes() {
  const { state, dispatch } = useAppState()

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/situation/:slug" element={<SituationPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>

      {!state.prefs.onboardingCompleted ? (
        <OnboardingModal
          onComplete={(payload) => {
            dispatch({ type: 'completeOnboarding', payload })
          }}
        />
      ) : null}
    </>
  )
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
