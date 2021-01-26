import React, { useState, useEffect } from "react";
import { Row, Col, Button, Container, Image } from "react-bootstrap";
import { useAuthDispatch, useAuthState } from "../context/Auth";
import {useMessageDispatch ,useMessageState} from "../context/message"
import { gql, useSubscription } from "@apollo/client";
import Users from "../components/users";
import Messages from "../components/messages";

const SUBSCRIPTION_NEW_MSG = gql`
subscription newMsg{ 
  newMsg{
        uuid
        content
        to
        from
        createdAt
  }
}
`

const SUBSCRIPTION_NEW_REACTION = gql`
subscription newReaction{ 
  newReaction{
        uuid content
        message{
          to from uuid
        }
              
  }
}
`


function Home() {

  const dispatch = useAuthDispatch();
  const msgDispatch = useMessageDispatch();
  const { user } = useAuthState();
  const { users } = useMessageState();

  const {data:msgData , error:Msgerror} = useSubscription(SUBSCRIPTION_NEW_MSG)
  const {data:ReactionData , error:ReactionError} = useSubscription(SUBSCRIPTION_NEW_REACTION)



  useEffect(() => {
    if(Msgerror) console.log(Msgerror)

    //get the selected user it may not be the selected user!! BECAREFULL
    // let userSelected = users.map(u=>u.useMessageState===true).username
    
    if(msgData){  
     // ABLE TO RCV MSG FROM OTHER (NON-SELECTED-USERS)
    // IF IT WAS TO ME , ADD IT TO THE FROM USER
    // IF IT WAS FROM ME , ADD IT TO THE TO USER
      const otherUser = user.username ===msgData.newMsg.to ?msgData.newMsg.from : msgData.newMsg.to
      msgDispatch({
        type:'ADD_NEW_MESSAGE',
        payload:{
          username:otherUser ,
          message:msgData.newMsg
        }
      })
    }
  }, [msgData , Msgerror ])

useEffect( ()=>{
  if(ReactionData){  
     
    // SEND IT TO THE 'FROM' 
    // if the message is to me then send the reaction to the other party
     const otherUser = user.username === ReactionData.newReaction.message.to?
     ReactionData.newReaction.message.from : ReactionData.newReaction.message.to 
     console.log(otherUser)

     msgDispatch({
       type:'ADD_NEW_REACTION',
       payload:{
         username:otherUser ,
         reaction:ReactionData.newReaction
       }
     })
   }
 }, [ReactionData , ReactionError ])

  const logout = () => {
    dispatch({
      type: "LOGOUT",
    });
    window.location.href = '/login'
    
  };

  return (
    <Container className="py-2 mt-2">
      <Row className="justify-content-around p-2 mb-2 bg-dark">
        <Button varient="text" disabled>
          Hello {user.username}
        </Button>

        <Button varient="link" onClick={logout}>
          logout
        </Button>
      </Row>
      <Row className='bg-dark'>
        <Users />
        <Messages />
      </Row>
    </Container>
  );
}

export default Home;
