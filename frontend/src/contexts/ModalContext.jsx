import { createContext, useContext, useState } from 'react'

const ModalContext = createContext({ openModal: () => {}, closeModal: () => {}, currentModal: null, modalData: null })

export function ModalProvider({ children }) {
  const [currentModal, setCurrentModal] = useState(null)
  const [modalData, setModalData] = useState(null)

  function openModal(name, data = null) {
    setCurrentModal(name)
    setModalData(data)
  }

  function closeModal() {
    setCurrentModal(null)
    setModalData(null)
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal, currentModal, modalData }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => useContext(ModalContext)
