import { Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"



function ProtectedRoute({children, role}){


const [loading,setLoading] = useState(true)

const [allowed,setAllowed] = useState(false)





useEffect(()=>{

checkUser()

},[])





async function checkUser(){


const {
data:{user}
}=await supabase.auth.getUser()



if(!user){

setAllowed(false)

setLoading(false)

return

}





const {data:profile}=await supabase

.from("profiles")

.select("role")

.eq("id",user.id)

.single()





if(profile?.role === role){

setAllowed(true)

}



setLoading(false)


}







if(loading){

return(

<div className="p-10 font-bold">

Checking access...

</div>

)

}







if(!allowed){

return <Navigate to="/login"/>

}





return children


}


export default ProtectedRoute