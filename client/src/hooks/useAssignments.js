import { useState } from "react"
import assignmentService from "../services/assignmentService"


export default function useAssignments() {


  const [assignments, setAssignments] = useState([])

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(null)





  async function fetchAssignments() {

    try {

      setLoading(true)

      setError(null)


      const data = await assignmentService.getAssignments()


      setAssignments(data)


    } catch (err) {

      setError(err.message)

    } finally {

      setLoading(false)

    }

  }






  async function createAssignment(assignment) {

    try {

      setLoading(true)


      const data = await assignmentService.createAssignment(
        assignment
      )


      setAssignments([
        data,
        ...assignments
      ])


      return data


    } catch (err) {

      setError(err.message)

      throw err


    } finally {

      setLoading(false)

    }

  }






  async function deleteAssignment(id) {

    try {

      await assignmentService.deleteAssignment(id)


      setAssignments(
        assignments.filter(
          (item) => item.id !== id
        )
      )


    } catch (err) {

      setError(err.message)

    }

  }






  return {

    assignments,

    loading,

    error,

    fetchAssignments,

    createAssignment,

    deleteAssignment

  }


}