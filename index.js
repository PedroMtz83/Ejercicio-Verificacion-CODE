require('dotenv').config();
const fs = require('fs');
const { ApolloServer, gql } = require('apollo-server');
const resolvers = require('./src/resolvers/userResolvers');


const typeDefs = gql(fs.readFileSync('./src/schema/user.graphql', 'utf8'));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req })
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Servidor listo en ${url}`);
});
