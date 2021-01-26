const { Message, User, Reaction } = require("../../models");
const {
  UserInputError,
  AuthenticationError,
  withFilter,
  ForbiddenError,
} = require("apollo-server");
const { Op } = require("sequelize");

module.exports = {
  Query: {
    getMessages: async (_, { from }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");
        const userFrom = await User.findOne({ where: { username: from } });
        if (!userFrom) throw new UserInputError("User not found");
        const usernames = [user.username, userFrom.username];
        const messages = await Message.findAll({
          where: {
            from: { [Op.in]: [usernames] },
            to: { [Op.in]: usernames },
          },
          order: [["createdAt", "DESC"]],
          //include all reactions that has the msg id
          include:[{model:Reaction , as:'reactions'}],
        });

        


        return messages;
      } catch (error) {
        throw error;
      }
    },
  },
  Mutation: {
    sendMessage: async (parent, { to, content }, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");
        // check there still exists a user with username in {to}
        const userTo = await User.findOne({ where: { username: to } });
        if (!userTo) throw new UserInputError("User not found");
        if (userTo.username === user.username)
          throw new UserInputError("You cannot send messages to yourself");
        if (content.trim() === "")
          throw new UserInputError("Message cannot be empty");
        const message = await Message.create({
          from: user.username,
          to,
          content,
        });

        pubsub.publish("NEW_MSG", { newMsg: message });

        return message;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    reactToMsg: async (_, { uuid, content }, { user , pubsub}) => {
      // A MESSAGE CAN HAVE A REACTION
      // check reactuin is valid
      // CREATE A REACTION IN REACTIONs TABLE
      // REFERE TO MSGID AND USER WHO MADE IT
      const reactions = ["❤️", "😆", "😯", "😢", "😡", "👍", "👎"];
      try {
        if (!user) throw new AuthenticationError("Unauthenticated usere");
        if (!reactions.includes(content))
          throw new UserInputError("No matching reactions");

        // FETCH THE USER
        const username = user ? user.username : "";
        user = await User.findOne({ where: { username } });
        if (!user) throw new AuthenticationError("Unauthenticated user2");

        //FETCH THE MESSAGE
        const message = await Message.findOne({ where: { uuid: uuid } });
        if (!message) throw new UserInputError("message not found");

        //USER ARE ALLOWED TO REACT TO MSG THAT THEY RCVED (to me)
        // if its to not me or from me
        if (message.to !== user.username || message.from === user.username)
          throw new ForbiddenError(
            "Not allowed to react to this message or yours!"
          );

        // IF THERE IS ALREADY ONE UPDATE IT ELSE CREATE

        let reaction = await Reaction.findOne({
          where: { messageId: message.id, userId: user.id },
        });

        if (reaction) {
          reaction.content = content;

          await reaction.save();
        } else {
          reaction = await Reaction.create({
            userId: user.id,
            messageId: message.id,
            content,
          });
        }
          pubsub.publish('NEW_REACTION',{newReaction:reaction})
        return reaction;
      } catch (error) {
        throw error;
      }
    },
  },
  Subscription: {
    newMsg: {
      subscribe: withFilter(
        (_, __, { pubsub, user }) => {
     
          if (!user) throw new AuthenticationError("unauthenticated");
          return pubsub.asyncIterator("NEW_MSG");
        },
        (parent, _, { user }) => {
          if (
            parent.newMsg.to === user.username ||
            parent.newMsg.from === user.username
          )
            return true;

          return false;
        }
      ),
    },
    newReaction: {
      subscribe: withFilter(
        // RUN THIS WITH CONDITIONS
        (_, __, { pubsub, user }) => {
     
          if (!user) throw new AuthenticationError("unauthenticated in ");
          return pubsub.asyncIterator('NEW_REACTION');
        },
        async(parent, _, { user }) => {
          // SINCE WE DO NOT HAVE THE MSG ONCE CRETED REACTION
          // NEED TO FETCH IT FIRST
          // getters for all attributes 
          const msg = await parent.newReaction.getMessage()
         
          if (
            msg.to === user.username   || msg.from === user.username         
          )
            return true;

          return false;
        }
      ),
    },
  },
};
