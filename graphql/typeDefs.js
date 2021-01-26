const { gql } = require('apollo-server');

module.exports =  gql`
type Group {
    groupName:String!
    id:String!
    usersIn:[User]!
}
type User {
    username:String!
    email:String
    createdAt:String!
    token:String
    latestMessage:Message
    imgUrl:String
    groupsIn:[Group]
 }
 type Message {
     content:String!
     to:String!
     from:String!
     uuid:String!
     createdAt:String!
     reactions:[Reaction]
 }
 type Reaction {
     uuid:String!
     content:String!
     createdAt:String!
     message:Message!
     user:User!
 }
 type Query {
     getUsers:[User]!
     login(username:String! , password:String!):User!
     getMessages(from:String!):[Message]!
 }
 type Mutation {
     register(username:String! email:String! password:String! confirmPassword:String!):User!
     sendMessage(content:String! , to:String!):Message!
     reactToMsg(uuid:String! , content:String!):Reaction!
     createGroup(groupName:String , users:[String]):Group!
 }
 type Subscription {
     newMsg:Message!
     newReaction:Reaction!
 }

`