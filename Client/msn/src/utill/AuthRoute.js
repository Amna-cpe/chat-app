import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuthState } from "../context/Auth";

function AuthRoute(props) {
  const {user} = useAuthState();
   if(props.authenticated && !user){
     // this page required to be authenticated
     return <Redirect to='/login' />
   }else if(props.guest && user){
     // trying to enter login/register while already logged in
     return <Redirect to ="/"/>

   }else{
     // if auth and logged in // guest and not logged in yet
     return <Route component={props.component} {...props} />
   }
}

export default AuthRoute;
