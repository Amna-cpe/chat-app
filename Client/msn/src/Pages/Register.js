import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { gql, useMutation } from "@apollo/client";
import {Link } from "react-router-dom"


const REGISTER = gql`
mutation register($username:String!, $password:String! , $email:String! ,$confirmPassword:String! ){
    register(
        username:$username,
        password:$password , 
        email:$email,
        confirmPassword:$confirmPassword){
            username email createdAt 

    }
}
`;
function Register(props) {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors,setErrors] = useState({})

  const[registerUser,{loading}] = useMutation(REGISTER,{
      update(_,res){
          console.log(res);
          setErrors({})
          props.history.push("/login")
      },
      onError(err){
        console.log(JSON.stringify(err, null, 2));
        setErrors(err.graphQLErrors[0].extensions.errors)
      },
      variables:values
  })

  const Submit = (e) => {
    e.preventDefault();
    console.log("submitting..", values);
    registerUser({variables:values})

  };

  return (
    <Container className="p-4 custome-size">
      <Row className="py-5 customeBg justify-content-center">
        <Col>
          <h1 className="text-center">Register</h1>
          <Form onSubmit={Submit}>
            <Form.Group controlId="formBasicEmail">
              <Form.Label className={errors.username&&"text-danger"}>{errors.username?errors.username:"Username"}</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Username"
                name="username"
                value={values.username}
                className={errors.username&&"is-invalid"}
                onChange={(e) =>
                  setValues({ ...values, username: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formBasicEmail">
              <Form.Label className={errors.email&&"text-danger"}> {errors.email?errors.email:"Email address"}</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                className={errors.email&&"is-invalid"}
                name="email"
                value={values.email}
                onChange={(e) =>
                  setValues({ ...values, email: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label className={errors.password&&"text-danger"}>{errors.password?errors.password:"Password"}</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                className={errors.password&&"is-invalid"}
                name="password"
                value={values.password}
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formBasicPassword">
              <Form.Label className={errors.confirmPassword&&"text-danger"}>{errors.confirmPassword?errors.confirmPassword:"ConfirmPassword"}</Form.Label>
              <Form.Control
                type="password"
                placeholder="confirm Password"
                className={errors.confirmPassword&&"is-invalid"}                
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={(e) =>
                  setValues({ ...values, confirmPassword: e.target.value })
                }
              />
            </Form.Group>

            <div className="text-center">
              <Button variant="success" type="submit" disables={loading}
              >
                {loading?"Loading...":"register"}
              </Button>
            </div>
            
            <div className="text-center">
          
            <small>Already have an account? <Link to="/login">Login</Link></small>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
