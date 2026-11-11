import { hasPerfil } from '../services/auth'
import Home from './Home'
import DoctorAgenda from './DoctorAgenda'

function HomeSwitch() {
  return hasPerfil('DOCTOR') ? <DoctorAgenda /> : <Home />
}

export default HomeSwitch