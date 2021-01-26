import React, { createContext, useReducer, useContext } from "react";
import jwtDecode from "jwt-decode";
const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

let user =null;
const token = localStorage.getItem("token");

if (token) {
  const decodedToken = jwtDecode(token);
  const expDate = new Date(decodedToken.exp * 1000);
  if (new Date() > expDate) {
    localStorage.removeItem(token);
  } else {
    user = decodedToken;
  }
} else {
  console.log('no token suuurrr!!!!!')
}

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        user: action.payload,
      };
      break;
    case "LOGOUT":
      localStorage.removeItem("token");
      return {
        ...state,
        user: null,
      };
      break;
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

export const AuthProvider = (props) => {
  const [state, dispatch] = useReducer(AuthReducer, { user });

  return (
    <AuthDispatchContext.Provider value={dispatch}>
      <AuthStateContext.Provider value={state}>
        {props.children}
      </AuthStateContext.Provider>
    </AuthDispatchContext.Provider>
  );
};

export const useAuthState = () => useContext(AuthStateContext);
export const useAuthDispatch = () => useContext(AuthDispatchContext);
