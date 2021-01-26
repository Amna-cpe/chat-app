import React ,{useState} from "react";
import { useAuthState } from "../context/Auth";
import { Button, OverlayTrigger ,Popover } from "react-bootstrap";
import classNames from "classnames";
import { formatDistance, parseISO } from "date-fns";
import {gql , useMutation }from "@apollo/client"

const REACT_TO_MSG = gql`
mutation reactToMsg($uuid:String! , $content:String!){
  reactToMsg(uuid:$uuid,content:$content){
    uuid
  }
}
`




export default function Message({ msg }) {
  const { user } = useAuthState();
  const [showPop,setShowPop] = useState(false)
  const send = user.username === msg.from;
  const rcv = user.username === msg.to;
  const EmojiSender = send&&'emoji-sender'
  const emojies =  ['❤️', '😆', '😯', '😢', '😡', '👍', '👎']
  const Emojies = msg.reactions.map(r=>r.content)

 

  const [reactToMsg] = useMutation(REACT_TO_MSG,{
          onError:err=>console.log(JSON.stringify(err, null, 2)),
          onCompleted:(data)=>{
              setShowPop(false)
          }
  })
  
  const react =(emoji)=>{
    console.log(emoji)
    reactToMsg({variables:{uuid:msg.uuid , content:emoji}})
  }
  const smile = (
    <OverlayTrigger
    trigger='click'
    placement='top'
    show={showPop}
    onToggle={()=>setShowPop(!showPop)}
    transition={false}
    rootClose
    overlay   ={
      <Popover className='rounded-pill '>
        <Popover.Content className='btn-emoji-rapper d-flex align-items-center'>
            {emojies.map(e=>(
              <Button varient ='link' className='bg-none btn-emoji' key={e} onClick={()=>react(e)}>
                    {e}
              </Button>
            ))}
        </Popover.Content>
      </Popover>
    } 
    >

    <Button varient="link" className="bg-none mt-2">
      <i className="far fa-smile primary "></i>
    </Button></OverlayTrigger>
  );



  return (
    <div className='d-flex align-items-start'>
    <div
      className={classNames("d-flex flex-column my-2 position-relative", {
        // "mr-auto": rcv,
        "ml-auto": send,
      })}
    >
      <div
        className={classNames("py-2 px-3 rounded-pill", {
          "bg-secondary": send,
          "text-white": send,
          "bg-white": rcv,
        })}
      >
        <p>{msg.content}</p>
        </div>
    
        <small className={classNames("text-white px-3", { "ml-auto": send })}>
          {formatDistance(parseISO(msg.createdAt), new Date())} ago
        </small>  

        {msg.reactions.length> 0 && (
        <div className={`emoji-chosen rounded-pill p-1 text-white  ${EmojiSender}`}>

          {Emojies} 
        </div>
      )}
      </div>
   
      {rcv && smile}
    </div>
  
  );
}
