import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Basketball from './pages/Basketball.jsx'
import Softball from './pages/Softball.jsx'
import Football from './pages/Football.jsx'
import Pickleball from './pages/Pickleball.jsx'
import Soccer from './pages/Soccer.jsx'
import Kickball from './pages/Kickball.jsx'
import Volunteer from './pages/Volunteer.jsx'
import EmpowerWay from './pages/EmpowerWay.jsx'
import Programs from './pages/Programs.jsx'
import Locations from './pages/Locations.jsx'
import PracticeBuilder from './pages/PracticeBuilder.jsx'
import PlanLibrary from './pages/PlanLibrary.jsx'
import DrillAdmin from './pages/DrillAdmin.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="basketball" element={<Basketball />} />
          <Route path="softball" element={<Softball />} />
          <Route path="football" element={<Football />} />
          <Route path="pickleball" element={<Pickleball />} />
          <Route path="soccer" element={<Soccer />} />
          <Route path="kickball" element={<Kickball />} />
          <Route path="volunteer" element={<Volunteer />} />
          <Route path="empower-way" element={<EmpowerWay />} />
          <Route path="programs" element={<Programs />} />
          <Route path="locations" element={<Locations />} />
          <Route path="practice-builder" element={<PracticeBuilder />} />
          <Route path="plan-library" element={<PlanLibrary />} />
          <Route path="drill-admin" element={<DrillAdmin />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
