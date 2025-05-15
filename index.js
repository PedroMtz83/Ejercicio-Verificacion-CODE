require('graphql-import-node'); 
const { ApolloServer } = require('apollo-server');
const resolvers = require('./src/resolvers/userResolvers');
const typeDefs = require('./src/schema/user.graphql.js');
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req })
});

server.listen({ port: 4000 }).then(({ url }) => console.log(`Servidor listo en ${url}`));
