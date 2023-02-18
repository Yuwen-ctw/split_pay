import { Routes, Route } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AppDispatch } from './app/store'
import { fetchAllGroups } from './features/user/userSlice'
import Layout from './components/Layout'
import CostList from './features/costs/CostList'
import SingleCost from './features/costs/SingleCost'
import WithCostForm from './features/costs/WithCostForm'

function App() {
  const dispatch: AppDispatch = useDispatch()
  dispatch(fetchAllGroups())
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<CostList />} />
        <Route path="/:costId" element={<SingleCost />} />
        <Route path="/create-cost" element={<WithCostForm />} />
        <Route path="/edit-cost/:costId" element={<WithCostForm />} />
      </Route>
    </Routes>
  )
}

export default App
