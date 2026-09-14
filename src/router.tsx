import { createBrowserRouter } from 'react-router-dom'
import { Dashboard } from './features/dashboard/Dashboard'
import { WorkoutPlayer } from './features/workout/WorkoutPlayer'
import { ExerciseLibrary } from './features/exercises/ExerciseLibrary'
import { NutritionScreen } from './features/nutrition/NutritionScreen'
import { CycleTracker } from './features/cycle/CycleTracker'
import { ProgressScreen } from './features/progress/ProgressScreen'
import { SettingsScreen } from './features/settings/SettingsScreen'
import { Onboarding } from './features/onboarding/Onboarding'
import { AppLayout } from './AppLayout'

export const router = createBrowserRouter([
  { path: '/onboarding', element: <Onboarding /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'workout', element: <WorkoutPlayer /> },
      { path: 'exercises', element: <ExerciseLibrary /> },
      { path: 'nutrition', element: <NutritionScreen /> },
      { path: 'cycle', element: <CycleTracker /> },
      { path: 'progress', element: <ProgressScreen /> },
      { path: 'settings', element: <SettingsScreen /> },
    ],
  },
])
