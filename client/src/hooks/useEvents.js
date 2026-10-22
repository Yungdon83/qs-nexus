import { useState } from "react"
import eventService from "../services/eventService"


export default function useEvents() {


  const [events, setEvents] = useState([])

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(null)





  async function fetchEvents() {

    try {

      setLoading(true)

      setError(null)


      const data = await eventService.getEvents()


      setEvents(data)


    } catch (err) {

      setError(err.message)

    } finally {

      setLoading(false)

    }

  }






  async function createEvent(event) {

    try {

      setLoading(true)


      const data = await eventService.createEvent(
        event
      )


      setEvents([
        data,
        ...events
      ])


      return data


    } catch (err) {

      setError(err.message)

      throw err


    } finally {

      setLoading(false)

    }

  }






  async function deleteEvent(id) {

    try {

      await eventService.deleteEvent(id)


      setEvents(
        events.filter(
          (item) => item.id !== id
        )
      )


    } catch (err) {

      setError(err.message)

    }

  }






  return {

    events,

    loading,

    error,

    fetchEvents,

    createEvent,

    deleteEvent

  }


}