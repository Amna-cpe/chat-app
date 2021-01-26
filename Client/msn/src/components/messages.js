import React, { useEffect ,useState } from "react";
import { Col, Form } from "react-bootstrap";
import { gql, useLazyQuery , useMutation } from "@apollo/client";
import { useMessageState, useMessageDispatch } from "../context/message";
import Message from "../components/Message";

const GET_MESSAGES_FROM_USER_SELECTED = gql`
  query getMessages($from: String!) {
    getMessages(from: $from) {
      to
      content
      createdAt
      uuid
      from
      reactions{
        uuid content
      }
    }
  }
`;

const ADD_MESSAGE = gql`
  mutation sendMessage($to: String!,$content:String!) {
    sendMessage(to: $to , content:$content) {
      to
      content
      createdAt
      uuid
      from
    }
  }
`;

function Messages() {
  const [content, setContent] = useState('')
    const { users } = useMessageState();
  const dispatch = useMessageDispatch();
  const userSelected = users?.find((u) => u.selectedUser === true);
  const messages = userSelected?.messages;

  const [getMessages, { loading: msgLoading, data: msgData }] = useLazyQuery(
    GET_MESSAGES_FROM_USER_SELECTED
  );

  const [addMessage , {data:newMsg}] = useMutation(ADD_MESSAGE,{
    // onCompleted:(data)=>dispatch({
    //   type:'ADD_NEW_MESSAGE',
    //   payload:{
    //     username:userSelected.username ,
    //     message:data.sendMessage
    //   }
    // }),
    onError:(err)=>console.log(JSON.stringify(err, null, 2))
  })


  useEffect(() => {
    //ONLY RENDER THE FIRST TIME (THE QUERY)
    if (userSelected && !userSelected.messages) {
      getMessages({ variables: { from: userSelected.username } });
    }
  }, [userSelected]);

  useEffect(() => {
    //IF IT RENDERED SAVE IT TO THE CONTEXT (NO USE OF QUERY AGAIN!!!)
    if (msgData) {
      dispatch({
        type: "SET_USER_MESSAGES",
        payload: {
          username: userSelected.username,
          messages: msgData.getMessages,
        },
      });
    }
  }, [msgData]);

  const submitTheMessage = (e)=>{
    e.preventDefault()
    if(userSelected && content!=='')
    addMessage({variables:{content,to:userSelected.username}})
  }

  let uiMessagesMarkup;
  if (!messages && !msgLoading) {
    uiMessagesMarkup = <p className="text-white info-text">Select a friend or group</p>;
  } else if (msgLoading) {
    uiMessagesMarkup = <p className='info-text'>loading honey..</p>;
  } else if (messages.length === 0) {
    uiMessagesMarkup = <p className='info-text'>NO MESSAGES BETWEEN YOU TOO START CHATING?</p>;
  } else if (messages.length > 0) {
    uiMessagesMarkup = messages.map((m, index) => (
      <>
        {" "}
        <Message key={m.uuid} msg={m} />
        {index === messages.length - 1 && (
          <div className="invisible">
            <hr className="m-0" />
          </div>
        )}
      </>
    ));
  }

  return (
    <Col  className="p-0 col-md-8 col-10">
      <div className="col-custome p-2">{uiMessagesMarkup}</div>
      <div className="bg-white">
        <Form className="d-flex " onSubmit={submitTheMessage}>
          <Form.Control
            size="lg"
            type="text"
            placeholder="Type.."
            className="mb-1 b-0"
            value={content}
            name='content'
            onChange={(e)=>(setContent(e.target.value))}
            disabled={!userSelected}
          />
          <img
            src="https://img.icons8.com/fluent/48/000000/filled-sent.png"
            role="button"
            disabled={!userSelected}
            className='btn-send'
            onClick={submitTheMessage}
          />
        </Form>
      </div>
    </Col>
  );
}

export default Messages;
