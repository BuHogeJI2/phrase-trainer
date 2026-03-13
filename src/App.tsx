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

export function AppRoutes() {
  const { state, dispatch, closeOnboarding, isOnboardingOpen } = useAppState()
  const shouldShowOnboarding = !state.prefs.onboardingCompleted || isOnboardingOpen

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

      {shouldShowOnboarding ? (
        <OnboardingModal
          mode={state.prefs.onboardingCompleted ? 'settings' : 'initial'}
          initialValues={{
            direction: state.prefs.direction,
            defaultLevel: state.prefs.defaultLevel,
            transliterationEnabled: state.prefs.transliterationEnabled,
          }}
          onClose={closeOnboarding}
          onComplete={(payload) => {
            dispatch({ type: 'completeOnboarding', payload })
            closeOnboarding()
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
