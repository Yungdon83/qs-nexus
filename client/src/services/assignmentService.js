import { supabase } from "../lib/supabase"


const assignmentService = {


  async createAssignment(assignment) {

    const { data, error } = await supabase
      .from("assignments")
      .insert(assignment)
      .select()
      .single()


    if (error) {

      throw error

    }


    return data

  },




  async getAssignments() {

    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .order("created_at", {
        ascending: false
      })


    if (error) {

      throw error

    }


    return data

  },





  async getLecturerAssignments(userId) {

    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", {
        ascending: false
      })


    if (error) {

      throw error

    }


    return data

  },





  async getAssignment(id) {

    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", id)
      .maybeSingle()


    if (error) {

      throw error

    }


    return data

  },





  async updateAssignment(id, updates) {

    const { data, error } = await supabase
      .from("assignments")
      .update(updates)
      .eq("id", id)
      .select()
      .single()


    if (error) {

      throw error

    }


    return data

  },





  async deleteAssignment(id) {

    const { error } = await supabase
      .from("assignments")
      .delete()
      .eq("id", id)


    if (error) {

      throw error

    }


    return true

  }


}



export default assignmentService