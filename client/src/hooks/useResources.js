import { useState } from "react"
import resourceService from "../services/resourceService"


export default function useResources() {


  const [resources, setResources] = useState([])

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(null)





  async function fetchResources() {

    try {

      setLoading(true)

      setError(null)


      const data = await resourceService.getResources()


      setResources(data)


    } catch (err) {

      setError(err.message)

    } finally {

      setLoading(false)

    }

  }






  async function createResource(resource) {

    try {

      setLoading(true)


      const data = await resourceService.createResource(
        resource
      )


      setResources([
        data,
        ...resources
      ])


      return data


    } catch (err) {

      setError(err.message)

      throw err


    } finally {

      setLoading(false)

    }

  }






  async function deleteResource(id) {

    try {

      await resourceService.deleteResource(id)


      setResources(
        resources.filter(
          (item) => item.id !== id
        )
      )


    } catch (err) {

      setError(err.message)

    }

  }






  return {

    resources,

    loading,

    error,

    fetchResources,

    createResource,

    deleteResource

  }


}