import express from "express";
import cookieParser from "cookie-parser";
import {ApolloServer} from "apollo-server-express";
import { buildSchema } from "type-graphql";
import {createConnection, ConnectionOptions} from "typeorm";
import Redis from "ioredis";
import "dotenv/config";
import path from "path";
import "reflect-metadata";
import { TKAuthChecker } from "./Middlewares/TKAuthChecker";
import User from "./Types/User";
import UserResolver from "./Resolvers/UserResolver";
import SetTokens from "./Middlewares/SetTokens";

const main = async () => {

  const {PORT, REDIS_URL} = process.env;

  const options: ConnectionOptions = {
    type: "postgres",
    username: "karudo",
    password: "Wtfilpcsm?!25",
    database: "titkok",
    entities: [User],
    migrations: [path.join(__dirname, "./migrations/*")],
    synchronize: true,
  };

  const conn = await createConnection(options);
  await conn.runMigrations();

  const redis = new Redis(REDIS_URL);

  const app = express();

  app.use(cookieParser());

  app.use('/graphql', SetTokens(redis));

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      authChecker: TKAuthChecker
    }),
    context: ({req}) => ({
      user: req.user,
      redis
    })
  });


  await apolloServer.start();
  apolloServer.applyMiddleware({app, path: "/graphql"});


  app.listen(PORT, () => {
    console.log(`>Server running on port ${PORT}`);
  });

}

main();
