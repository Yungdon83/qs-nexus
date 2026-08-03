import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import LogoutButton from "../components/LogoutButton"


function AdminDashboard() {

  const [stats, setStats] = useState({
    students: 0,
    lecturers: 0,
    courses: 0,
    resources: 0,
    announcements: 0,
    events: 0,
  })


  useEffect(() => {

    loadStats()

  }, [])



  async function loadStats() {


    const { count: students } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")



    const { count: lecturers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "lecturer")



    const { count: courses } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })



    const { count: resources } = await supabase
      .from("resources")
      .select("*", { count: "exact", head: true })



    const { count: announcements } = await supabase
      .from("announcements")
      .select("*", { count: "exact", head: true })



    const { count: events } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })



    setStats({

      students: students || 0,

      lecturers: lecturers || 0,

      courses: courses || 0,

      resources: resources || 0,

      announcements: announcements || 0,

      events: events || 0,

    })


  }





  return (

    <div className="min-h-screen bg-gray-100">


      <div className="bg-blue-900 text-white px-10 py-6 flex justify-between items-center">


        <div>

          <h1 className="text-3xl font-bold">
            QS Nexus HOD Dashboard
          </h1>

          <p className="text-blue-100 mt-2">
            Department Administration Portal
          </p>

        </div>


        <LogoutButton />


      </div>





      <div className="max-w-7xl mx-auto p-8">



        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-5">



          <StatCard
            title="Students"
            value={stats.students}
          />


          <StatCard
            title="Lecturers"
            value={stats.lecturers}
          />


          <StatCard
            title="Courses"
            value={stats.courses}
          />


          <StatCard
            title="Resources"
            value={stats.resources}
          />


          <StatCard
            title="Announcements"
            value={stats.announcements}
          />


          <StatCard
            title="Events"
            value={stats.events}
          />



        </div>





        <h2 className="text-3xl font-bold text-blue-900 mt-10 mb-6">
          Management
        </h2>





        <div className="grid md:grid-cols-3 gap-6">



          <DashboardCard
            title="Manage Students"
            text="View and manage department students."
            link="/manage-students"
          />
<DashboardCard
  title="Manage Timetable"
  text="Create and manage department timetable."
  link="/manage-timetable"
/>


          <DashboardCard
            title="Manage Lecturers"
            text="Manage lecturer accounts and profiles."
            link="/manage-lecturers"
          />



          <DashboardCard
            title="Manage Courses"
            text="Add and update department courses."
            link="/manage-courses"
          />



          <DashboardCard
  title="Manage Resources"
  text="View and control uploaded learning materials."
  link="/admin-resources"
/>



          <DashboardCard
  title="Manage Announcements"
  text="Control department notices."
  link="/admin-announcements"
/>



          <DashboardCard
  title="Manage Events"
  text="Manage seminars and activities."
  link="/admin-events"
/>



        </div>



      </div>


    </div>

  )

}





function StatCard({ title, value }) {

  return (

    <div className="bg-white rounded-xl shadow p-5">

      <p className="text-gray-500">
        {title}
      </p>

      <h2 className="text-3xl font-bold text-blue-900 mt-2">
        {value}
      </h2>

    </div>

  )

}






function DashboardCard({ title, text, link }) {

  return (

    <Link
      to={link}
      className="bg-white rounded-xl shadow p-6 hover:shadow-lg"
    >

      <h3 className="text-xl font-bold text-blue-900">
        {title}
      </h3>

      <p className="text-gray-600 mt-3">
        {text}
      </p>

    </Link>

  )

}



export default AdminDashboard