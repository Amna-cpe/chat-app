import { compareSync } from "bcryptjs";
import React, { createContext, useReducer, useContext } from "react";

const MessageStateContext = createContext();
const MessageDispatchContext = createContext();

const MessageReducer = (state, action) => {
  let usersCopy;
  const { username, messages, message, reaction } = action.payload;
  let userIndex;
  switch (action.type) {
    case "SET_USERS":
      return {
        ...state,
        users: action.payload,
      };
      break;
    case "SET_USER_SELECTED":
      usersCopy = state.users.map((u) => ({
        ...u,
        selectedUser: u.username === action.payload ? true : false,
      }));

      return {
        ...state,
        users: usersCopy,
      };
      break;
    case "SET_USER_MESSAGES":
      usersCopy = [...state.users];
      // FIND AN INDEX OF THE USER AND INSERT TO IT THE MESSAGES

      userIndex = usersCopy.findIndex((u) => u.username === username);
      usersCopy[userIndex] = { ...usersCopy[userIndex], messages };
      // RE-WRITE THE USERS
      return {
        ...state,
        users: usersCopy,
      };
      break;

    case "ADD_NEW_MESSAGE":
      // COPY USERS
      usersCopy = [...state.users];
      // FIND THE INDEX of the 'to' user
      userIndex = usersCopy.findIndex((u) => u.username === username);
      // ATTACH TO THE USER A NEW MSG

      //IF HAVENT SELECTED 'USER' YET STILL NOT HAVE MSGEESD
      // IF YOU TRY TO ADD TO IT IT WILL FAIL -->FIXX
      usersCopy[userIndex].messages
        ? (usersCopy[userIndex].messages = [
            message,
            ...usersCopy[userIndex].messages,
          ])
        : (usersCopy[userIndex].messages = null);
      usersCopy[userIndex].latestMessage = message;

      // WHEN THE USER ADD MESSAGE IT DOES NOT HAVE REACTIONS NEED TO SET IT 
      // EMPTY ARRAY
      usersCopy[userIndex].messages[0].reactions = []

      return {
        ...state,
        users: usersCopy,
      };

    case "ADD_NEW_REACTION":
      // COPY USERS
      usersCopy = [...state.users];
      // FIND THE INDEX of the 'from' 
      userIndex = usersCopy.findIndex((u) => u.username === username);
      //COPY THE USER
      let userCopy = { ...usersCopy[userIndex] };
      // get the msg index
      let msgIndex = userCopy.messages?.findIndex(
        (m) => m.uuid === reaction.message.uuid
      );
    
      if (msgIndex > -1) {
        // if the msg exist
        //copy of users msgs
        let msgsCopy = [...userCopy.messages];
        let reactionsCopy = [...msgsCopy[msgIndex].reactions];
        let reactionIndex = reactionsCopy.findIndex(
          (r) => r.uuid === reaction.uuid
        );
        if (reactionIndex > -1) {
          //reaction exists need to be update
          reactionsCopy[reactionIndex] = reaction;
        } else {
          //new reaction add it
          reactionsCopy = [...reactionsCopy, reaction]
        }
        msgsCopy[msgIndex] = {
          ...msgsCopy[msgIndex],
          reactions:reactionsCopy
        }
        userCopy = {...userCopy , messages:msgsCopy}
        usersCopy[userIndex]=userCopy
      }

      return {
        ...state,
        users: usersCopy,
      };

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

export const MessageProvider = (props) => {
  const [state, dispatch] = useReducer(MessageReducer, { users: null });

  return (
    <MessageDispatchContext.Provider value={dispatch}>
      <MessageStateContext.Provider value={state}>
        {props.children}
      </MessageStateContext.Provider>
    </MessageDispatchContext.Provider>
  );
};

export const useMessageState = () => useContext(MessageStateContext);
export const useMessageDispatch = () => useContext(MessageDispatchContext);
