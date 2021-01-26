const { Message, User, Group } = require("../../models");
const bcrypt = require("bcryptjs");
const { UserInputError, AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");


// it is a seqlize conditioner(operators)
const { Op } = require("sequelize");

module.exports = {
  Query: {
    getUsers: async (_, __, { user }) => {
      console.log(user);
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        //FIND ALL THE USERS EXPEPT ME
        let users = await User.findAll({
          attributes: ["username", "imgUrl", "createdAt"],
          where: { username: { [Op.ne]: user.username } },
        });

        // GET ALL MSGS BETWEEN each user and me that is either from me or to me
        // IN DESC ORDER (latest one)
        const AllUsersMsgs = await Message.findAll({
          where: {
            [Op.or]: [{ to: user.username }, { from: user.username }],
          },
          order: [["createdAt", "DESC"]],
        });

        //LOOP THROUGH EACH USER AND ADD LATESMSG TO THEM
        //(note: this will change for every loggin in user)
        users = users.map((OtherUser) => {
          console.log(OtherUser);
          const latestMessage = AllUsersMsgs.find(
            (m) => m.from === OtherUser.username || m.to === OtherUser.username
          );
          OtherUser.latestMessage = latestMessage;
          return OtherUser;
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

    createGroup: async (_, { groupName, users }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("not authenticated");
        if (users.length === 1)
          throw new UserInputError("a group must be at least 3!");

        const group = await Group.create({
          groupName,
        });

        // await group.addUser(user)
        //ASSIGN EACH USER THE ID
        let usersIn = [];
        for (let i = 0; i < users.length; i++) {
          const uIn = await User.findOne({ where: { username: users[i] } });        
          usersIn.push(uIn);
        }
        group.usersIn = usersIn;

        return group;
      } catch (error) {
        throw error;
      }
    },
  },
};
