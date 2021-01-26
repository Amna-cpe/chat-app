const { Message , User  } = require("../models");
const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require("apollo-server");
const { CheckResultAndHandleErrors } = require("apollo-server");
const jwt = require("jsonwebtoken");


// it is a seqlize conditioner(operators)
const { Op } = require("sequelize");

module.exports = {
  Query: {
    getUsers: async (_, __, { user }) => {
      console.log(user);
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");
        const users = await User.findAll({
          where: { username: { [Op.ne]: user.username } },
        });
        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    login: async (_, args) => {
      const { username, password } = args;
      let errors = {};
      try {
        // validate
        if (username.trim() === "")
          errors.username = "username must not be empty";
        if (password === "") errors.password = "Password must not be empty";
        if (Object.keys(errors).length > 0)
          throw new UserInputError("BAD INPUT", { errors });

        // check if user exist
        const user = await User.findOne({ where: { username } });
        if (!user) {
          errors.username = "User not found";
          throw new UserInputError("user not found", { errors });
        }

        const compareRes = await bcrypt.compare(password, user.password);
        // COMPARE PASSWORD

        if (!compareRes) {
          errors.password = "password is not correact";
          throw new UserInputError("Password is not correct", { errors });
        }
        const token = await jwt.sign({ username }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        return {
          ...user.toJSON(),
          createdAt: user.createdAt.toISOString(),
          token,
        };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
  Mutation: {
    register: async (_, args) => {
      let { username, email, password, confirmPassword } = args;
      let errors = {};

      try {
        // valideate
        if (email.trim() === "") errors.email = "Email must not be empty";
        if (username.trim() === "")
          errors.username = "username must not be empty";
        if (password.trim() === "")
          errors.password = "Password must not be empty";
        if (confirmPassword.trim() === "")
          errors.confirmPassword = "password must not be empty";
        if (confirmPassword !== password)
          errors.confirmPassword = "Password must mutch";

        //CHECK IF USERNAME  EXIST ALREADY
        // const userByUsername = await User.findOne({where:{username}})
        // const userByEmail = await User.findOne({where:{email}})
        // if(userByUsername) errors.username = 'username is taken'
        // if(userByEmail) errors.email = 'email is taken'

        if (Object.keys(errors).length > 1) {
          throw errors;
        }
        // create user

        //HASH PASSWORD
        password = await bcrypt.hash(password, 6);
        const user = await User.create({ username, email, password });
        return user;
      } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
          err.errors.forEach((e) => {
            let target = e.path.split(".");
            return (errors[target[1]] = `${target[1]} is already taken`);
          });
        } else if (err.name === "SequelizeValidationError") {
          err.errors.forEach((e) => (errors[e.path] = e.message));
        }
        throw new UserInputError("Bad Input", { errors });
      }
    },

    sendMessage: async (parent, { to, content }, {user}) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");
        //TODO: check there still exists a user with username in {to}
        const userTo = await User.findOne({where:{username:to}})
        if(!userTo) throw new UserInputError("User not found")
        if(userTo.username === user.username) throw new UserInputError("You cannot send messages to yourself")
        if(content.trim()==="") throw new UserInputError("Message cannot be empty")
        const message = await Message.create({
          from:user.username,
          to,
          content         
        });
        return message;

      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};
