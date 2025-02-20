export const typeDefs = `
  type AuthPayload {
    accessToken: String!
    refreshToken: String!
  }

  enum Role {
    ADMIN
    USER
  }

  type LogoutMessage {
    message: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    createdAt: String!
  }

  type Query {
    getUser(id: ID!): User
    getAllUsers: [User]
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!, role: Role): User
    login(email: String!, password: String!): AuthPayload
    refreshToken(refreshToken: String!): AuthPayload
    logout: LogoutMessage
  }
`;
