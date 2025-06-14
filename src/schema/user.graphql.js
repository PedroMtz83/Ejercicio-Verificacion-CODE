const { gql } = require('apollo-server');

module.exports = gql`
  type User {
    id: ID!
    email: String!
    phone: String
    isVerified: Boolean!
  }

  type AuthCode {
    userId: ID!
    code: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String
    user: User
    message: String
  }

  input RegisterInput {
    email: String!
    phone: String
    via: String!
  }

  input VerifyInput {
    email: String!
    code: String!
  }

  type Query {
    dummyQuery: String
  }

  type Mutation {
    registerUser(input: RegisterInput!): AuthPayload!
    verifyCode(input: VerifyInput!): AuthPayload!
    login(email: String!): AuthPayload!
  }
`;
