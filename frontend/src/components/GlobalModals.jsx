import { useModal } from '../contexts/ModalContext.jsx'
import { useUser } from '../contexts/UserContext.jsx'
import WaterModal from './WaterModal.jsx'
import MealModal from './MealModal.jsx'
import HabitsModal from './HabitsModal.jsx'
import SleepModal from './SleepModal.jsx'
import MeasureModal from './MeasureModal.jsx'

export default function GlobalModals() {
  const { currentModal, modalData, closeModal } = useModal()
  const user = useUser()

  if (!currentModal || !user) return null

  const props = { userId: user.id, onClose: closeModal }

  return (
    <>
      {currentModal === 'water'   && <WaterModal   {...props} />}
      {currentModal === 'meal'    && <MealModal    {...props} initialData={modalData} />}
      {currentModal === 'habits'  && <HabitsModal  {...props} />}
      {currentModal === 'sleep'   && <SleepModal   {...props} />}
      {currentModal === 'measure' && <MeasureModal {...props} />}
    </>
  )
}
