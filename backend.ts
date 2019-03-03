import { ApolloServer, gql } from "apollo-server";
import * as express from "express";

const books = [
    {
        id: 1,
        title: "Harry Potter and the Chamber of Secrets",
        author: "J.K. Rowling"
    },
    {
        id: 2,
        title: "Jurassic Park",
        author: "Michael Crichton"
    }
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
    # Comments in GraphQL are defined with the hash (#) symbol.

    # This "Book" type can be used in other type declarations.
    type Book {
        id: Int
        title: String
        author: String
    }

    # The "Query" type is the root of all GraphQL queries.
    # (A "Mutation" type will be covered later on.)
    type Query {
        books: [Book]
    }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
    Query: {
        books: () => books
    }
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen(5000).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});

const expressApp = express();

expressApp.get("/shops", (req, res) => {
    console.log(`Backend: GET ${req.path}`);
    res.json([{ name: "Book 1st" }, { name: "Book 2nd" }]);
});

expressApp.get("/books/:id/price", (req, res) => {
    console.log(`Backend: GET ${req.path}`);
    res.json({ data: 1000 * Number(req.params.id) });
});

const port = 6000;
expressApp.listen(port, () => console.log(`Example app listening on port ${port}!`));
