const UserResolvers = require("./resolvers/user");
const msgResolvers = require("./resolvers/messages");
const { Message, User } = require("../models");
module.exports = {
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  User: {
    createdAt: (parent) => parent.createdAt.toISOString(),
    
  },
  Reaction: {
    createdAt: (parent) => parent.createdAt.toISOString(),
    message: async (parent) => await Message.findByPk(parent.messageId),
    user: async (parent) => await User.findByPk(parent.userId , {attributes:['username','imgUrl','createdAt']}),
  },
  Query: {
    ...UserResolvers.Query,
    ...msgResolvers.Query,
  },
  Mutation: {
    ...UserResolvers.Mutation,
    ...msgResolvers.Mutation,
  },
  Subscription: {
    ...msgResolvers.Subscription,
  },
};
