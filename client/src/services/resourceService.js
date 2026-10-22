import { supabase } from "../lib/supabase"


const resourceService = {


  async createResource(resource) {

    const { data, error } = await supabase
      .from("resources")
      .insert(resource)
      .select()
      .single()


    if (error) {

      throw error

    }


    return data

  },





  async getResources() {

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", {
        ascending: false
      })


    if (error) {

      throw error

    }


    return data

  },





  async getLecturerResources(userId) {

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("uploaded_by", userId)
      .order("created_at", {
        ascending: false
      })


    if (error) {

      throw error

    }


    return data

  },





  async getResource(id) {

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("id", id)
      .maybeSingle()


    if (error) {

      throw error

    }


    return data

  },





  async updateResource(id, updates) {

    const { data, error } = await supabase
      .from("resources")
      .update(updates)
      .eq("id", id)
      .select()
      .single()


    if (error) {

      throw error

    }


    return data

  },





  async deleteResource(id) {

    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", id)


    if (error) {

      throw error

    }


    return true

  }

}


export default resourceService