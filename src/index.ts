import express from "express";
import cookieParser from "cookie-parser";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection, ConnectionOptions } from "typeorm";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { TKAuthChecker } from "./Middlewares/TKAuthChecker";
import User from "./Types/User";
import UserResolver from "./Resolvers/UserResolver";
import AuthResolver from "./Resolvers/AuthResolver";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import RequestToken from "./request_token";
import { graphqlUploadExpress } from "graphql-upload";
import {
  __prod__,
  REDIS_URL,
  PORT,
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
} from "./config";

const main = async () => {
  const options: ConnectionOptions = {
    type: "postgres",
    username: POSTGRES_USERNAME,
    password: POSTGRES_PASSWORD,
    database: "titkok",
    entities: [User],
    migrations: [path.join(__dirname, "./migrations/*")],
    synchronize: !__prod__,
    logging: !__prod__,
  };

  const conn = await createConnection(options);
  await conn.runMigrations();

  const redis = new Redis(REDIS_URL);

  const app = express();
  app.use(graphqlUploadExpress());

  app.use(cookieParser());

  app.get("/request_token", RequestToken(redis));

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, AuthResolver],
      authChecker: TKAuthChecker,
      dateScalarMode: "timestamp",
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      conn,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" });

  app.listen(PORT, () => {
    console.log(`>Server running on port ${PORT}`);
  });
};

main();
