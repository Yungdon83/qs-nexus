import { supabase } from "../lib/supabase"


const announcementService = {


  async createAnnouncement(announcement) {

    const { data, error } = await supabase
      .from("announcements")
      .insert(announcement)
      .select()
      .single()


    if (error) {

      throw error

    }


    return data

  },





  async getAnnouncements() {

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", {
        ascending: false
      })


    if (error) {

      throw error

    }


    return data

  },





  async getLecturerAnnouncements(userId) {

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("posted_by", userId)
      .order("created_at", {
        ascending: false
      })


    if (error) {

      throw error

    }


    return data

  },





  async getAnnouncement(id) {

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .maybeSingle()


    if (error) {

      throw error

    }


    return data

  },





  async updateAnnouncement(id, updates) {

    const { data, error } = await supabase
      .from("announcements")
      .update(updates)
      .eq("id", id)
      .select()
      .single()


    if (error) {

      throw error

    }


    return data

  },





  async deleteAnnouncement(id) {

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id)


    if (error) {

      throw error

    }


    return true

  }


}


export default announcementService