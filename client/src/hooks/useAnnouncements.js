import { useState } from "react"
import announcementService from "../services/announcementService"


export default function useAnnouncements() {


  const [announcements, setAnnouncements] = useState([])

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(null)





  async function fetchAnnouncements() {

    try {

      setLoading(true)

      setError(null)


      const data = await announcementService.getAnnouncements()


      setAnnouncements(data)


    } catch (err) {

      setError(err.message)

    } finally {

      setLoading(false)

    }

  }






  async function createAnnouncement(announcement) {

    try {

      setLoading(true)


      const data = await announcementService.createAnnouncement(
        announcement
      )


      setAnnouncements([
        data,
        ...announcements
      ])


      return data


    } catch (err) {

      setError(err.message)

      throw err


    } finally {

      setLoading(false)

    }

  }






  async function deleteAnnouncement(id) {

    try {

      await announcementService.deleteAnnouncement(id)


      setAnnouncements(
        announcements.filter(
          (item) => item.id !== id
        )
      )


    } catch (err) {

      setError(err.message)

    }

  }






  return {

    announcements,

    loading,

    error,

    fetchAnnouncements,

    createAnnouncement,

    deleteAnnouncement

  }


}