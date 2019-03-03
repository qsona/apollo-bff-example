import { ApolloServer, gql } from "apollo-server";

import {
    makeExecutableSchema,
    makeRemoteExecutableSchema,
    addMockFunctionsToSchema,
    mergeSchemas,
    transformSchema,
    FilterRootFields,
    RenameTypes,
    RenameRootFields,
    introspectSchema
} from "graphql-tools";

import { createApolloFetch } from "apollo-fetch";
import fetch from "node-fetch";
import { print } from "graphql";

const fetcher = async ({ query: queryDocument, variables, operationName, context }) => {
    const query = print(queryDocument);
    const fetchResult = await fetch("http://localhost:5000", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query, variables, operationName })
    });
    return fetchResult.json();
};

(async function() {
    try {
        //const fetcher = createApolloFetch({ uri: "http://localhost:5000" });
        //const fetcher = createApolloFetch({ uri: "http://api.githunt.com/graphql" });
        console.log("======================================");
        const books = [
            {
                title: "Harry Potter and the Chamber of Secrets 2",
                author: "J.K. Rowling 2"
            },
            {
                title: "Jurassic Park 2",
                author: "Michael Crichton 2"
            }
        ];
        const remoteSchema = await introspectSchema(fetcher);
        const bookSchema = await makeRemoteExecutableSchema({ schema: remoteSchema, fetcher });

        // Mocked author schema
        // const resolvers = {
        //     Query: {
        //         books2: () => books
        //     }
        // };
        // const book2Schema = makeExecutableSchema({
        //     typeDefs: `
        // type Book {
        //     title: String
        //     author: String
        // }

        // # The "Query" type is the root of all GraphQL queries.
        // # (A "Mutation" type will be covered later on.)
        // type Query {
        //     books2: [Book]
        // }
        // `,
        //     resolvers
        // });

        const shopSchema = makeExecutableSchema({
            typeDefs: `
        type Shop {
            name: String
        }

        type Query {
            shops: [Shop]
        }
            `,
            resolvers: {
                Query: {
                    shops: async () => {
                        const fetchResult = await fetch("http://localhost:6000/shops", {
                            method: "GET"
                        });
                        return fetchResult.json();
                    }
                }
            }
        });

        // addMockFunctionsToSchema({ schema: bookSchema });

        const extendBookTypeDefs = `
        extend type Book {
            price: Int
        }        
        `;

        const schema = mergeSchemas({
            schemas: [shopSchema, bookSchema, extendBookTypeDefs],
            resolvers: {
                Book: {
                    price: {
                        resolve: async book => {
                            const id = book.id as number;
                            const fetchResult = await fetch(`http://localhost:6000/books/${id}/price`, {
                                method: "GET"
                            });
                            const json = await fetchResult.json();
                            return json.data;
                        }
                    }
                }
            }
        });

        // Resolvers define the technique for fetching the types in the
        // schema.  We'll retrieve books from the "books" array above.

        // In the most basic sense, the ApolloServer can be started
        // by passing type definitions (typeDefs) and the resolvers
        // responsible for fetching the data for those types.
        const server = new ApolloServer({ schema });

        // This `listen` method launches a web-server.  Existing apps
        // can utilize middleware options, which we'll discuss later.
        server.listen().then(({ url }) => {
            console.log(`🚀  Server ready at ${url}`);
        });
    } catch (e) {
        console.log(e);
        console.log(JSON.stringify(e));
    }
})();
