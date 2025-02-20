export const taskTypeDefs = `
  enum Priority {
    LOW
    MEDIUM
    HIGH
  }

  type Task {
    id: ID!
    title: String!
    description: String
    priority: Priority!
    done: Boolean!
    archived: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    getTask(id: ID!): Task
    getAllTasks: [Task]!
  }

  type Mutation {
    createTask(title: String!, description: String, priority: Priority!): Task
    updateTask(id: ID!, title: String, description: String, priority: Priority, done: Boolean, archived: Boolean): Task
    deleteTask(id: ID!): Boolean
    toggleTaskDone(id: ID!): Task
    toggleTaskArchived(id: ID!): Task
  }
`;
