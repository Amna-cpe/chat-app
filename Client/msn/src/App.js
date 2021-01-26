import "./App.scss";
import Register from "./Pages/Register";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import ApolloProvider from "./ApolloProvider";
import { AuthProvider } from "./context/Auth";
import { MessageProvider } from "./context/message";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import AuthRoute from "./utill/AuthRoute";

function App() {
  return (
    <ApolloProvider>
      <AuthProvider>
        <MessageProvider>
          <Router>
            <Switch>
              <AuthRoute exact path="/" component={Home} authenticated />
              <AuthRoute exact path="/register" component={Register} guest />
              <AuthRoute exact path="/login" component={Login} guest />
            </Switch>
          </Router>
        </MessageProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
