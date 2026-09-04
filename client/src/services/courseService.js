import { supabase } from "../lib/supabase"


const courseService = {


  async createCourse(course) {

    const { data, error } = await supabase
      .from("courses")
      .insert(course)
      .select()
      .single()


    if (error) {

      throw error

    }


    return data

  },





  async getCourses() {

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", {
        ascending: false
      })


    if (error) {

      throw error

    }


    return data

  },





  async getCoursesByLevel(level) {

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("level", level)
      .order("course_code", {
        ascending: true
      })


    if (error) {

      throw error

    }


    return data

  },





  async getCourse(id) {

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .maybeSingle()


    if (error) {

      throw error

    }


    return data

  },




  async getCourseByCode(courseCode) {

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("course_code", courseCode)
      .maybeSingle()


    if (error) {

      throw error

    }


    return data

  },





  async updateCourse(id, updates) {

    const { data, error } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", id)
      .select()
      .single()


    if (error) {

      throw error

    }


    return data

  },





  async deleteCourse(id) {

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id)


    if (error) {

      throw error

    }


    return true

  }


}


export default courseService