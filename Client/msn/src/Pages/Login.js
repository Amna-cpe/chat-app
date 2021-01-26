import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { gql, useLazyQuery } from "@apollo/client";
import {Link } from "react-router-dom"
import {useAuthDispatch} from "../context/Auth";

const LOGIN = gql`
  query login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      username
      email
      createdAt
      token
    }
  }
`;
function Login(props) {
  const [values, setValues] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const dispatch = useAuthDispatch();

  const [loginUser, { loading }] = useLazyQuery(LOGIN, {
    onError(err) {
      console.log(JSON.stringify(err, null, 2));
      setErrors(err.graphQLErrors[0].extensions.errors);
    },
    onCompleted(data) {
      console.log(data);
      
      dispatch({type:"LOGIN",payload:data.login})
      setErrors({});
      window.location.href = "/";
    },
  });

  const Submit = (e) => {
    e.preventDefault();
    console.log("submitting..", values);
    loginUser({ variables: values });
  };

  return (
    <Container className="p-4 custome-size">
      <Row className="py-5 customeBg justify-content-center">
        <Col>
          <h1 className="text-center">Login</h1>
          <Form onSubmit={Submit}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label className={errors.username && "text-danger"}>
                {errors.username ? errors.username : "Username"}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Username"
                name="username"
                value={values.username}
                className={errors.username && "is-invalid"}
                onChange={(e) =>
                  setValues({ ...values, username: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label className={errors.password && "text-danger"}>
                {errors.password ? errors.password : "Password"}
              </Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                className={errors.password && "is-invalid"}
                name="password"
                value={values.password}
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
              />
            </Form.Group>

            <div className="text-center">
              <Button variant="success" type="submit" disables={loading}>
                {loading ? "Loading..." : "login"}
              </Button>
            </div>
            <div className="text-center">
            <small>Don't have an account? <Link to="/register">Register</Link></small>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
