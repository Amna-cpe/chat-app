const { ApolloServer} = require('apollo-server');
require("dotenv").config()




const {sequelize} = require('./models')
// The GraphQL schema
const typeDefs = require('./graphql/typeDefs')
// A map of functions which return data for the schema.
const resolvers = require('./graphql/index')
const contextMiddleWare = require("./util/contextMiddleWare")

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: contextMiddleWare,
    subscriptions:{path:'/'}
  });
  
  server.listen().then(({ url ,subscriptionsUrl }) => {
    console.log(`🚀 Server ready at ${url}`);
    console.log(`🚀 Subscriptions ready at  ${subscriptionsUrl}`);
  });

  sequelize.authenticate()
  .then(()=>console.log('db connected'))
  .catch(err=>console.log('error'))