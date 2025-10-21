"use client"
import { useRouter } from "next/navigation"
import MapModal from "@/components/MapModal"

export default function MapPage() {
  const router = useRouter()

  const handleClose = () => {
    // This will be handled by the modal component
  }

  return <MapModal isOpen={true} onClose={handleClose} />
}
