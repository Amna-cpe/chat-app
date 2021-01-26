import React from "react";
import {  Col , Image} from "react-bootstrap";
import { gql, useQuery } from "@apollo/client";
import {useMessageState, useMessageDispatch} from "../context/message"
import classNames from "classnames"

const GET_USERS = gql`
  query getUsers {
    getUsers {
      username
      createdAt
      imgUrl
      latestMessage {
        content
        createdAt
        to
        from
      }
    }
  }
`;

function Users() {
  const {users} = useMessageState()
  const dispatch = useMessageDispatch()
  const userSelected = users?.find(u=>u.selectedUser===true)?.username
  const { loading} = useQuery(GET_USERS, {
      onCompleted:data=>(
          dispatch({
              type:'SET_USERS',
              payload:data.getUsers
          })
      ),
      onError:err=>console.log(err)
  });
  let uiMarkup = "";

  if (!users || loading) {
    uiMarkup = <p>Loading..</p>;
  } else if (users.length === 0) {
    uiMarkup = <p>No users are online</p>;
  } else if (users.length > 0) {
    uiMarkup = users.map((user) => {
        const selected = userSelected===user.username
     
     return( <div
     
        role='button'
        className={classNames("d-flex flex-md-row flex-column p-3 user-div  text-white ",{'bg-dark':selected})}
        key={user.username}
        onClick={() => dispatch({
          type:'SET_USER_SELECTED',
          payload: user.username
        })}
      >
        <Image
          src={user.imgUrl ?user.imgUrl:"https://merriam-webster.com/assets/mw/images/article/art-wap-article-main/egg-3442-e1f6463624338504cd021bf23aef8441@2x.jpg" }
          roundedCircle
          className="mr-2"
          style={{ width: 40, height: 40, objectFit: "cover" }}
        />
        <div className=''>
          <p className="text-success ml-2">{user.username}</p>
          <p className="font-weight-light d-none d-md-block">
            {user.latestMessage ? user.latestMessage.content : ""}
          </p>
        </div>
      </div>)
    });
  }

  return (
    <Col xs={2} md={4} className="p-0 bg-secondary">
      {uiMarkup}
    </Col>
  );
}

export default Users;
