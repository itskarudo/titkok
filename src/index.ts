import express from "express";
import cookieParser from "cookie-parser";
import {ApolloServer} from "apollo-server-express";
import { buildSchema } from "type-graphql";
import {createConnection, ConnectionOptions} from "typeorm";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { TKAuthChecker } from "./Middlewares/TKAuthChecker";
import User from "./Types/User";
import UserResolver from "./Resolvers/UserResolver";
import AuthResolver from "./Resolvers/AuthResolver";
import SetTokens from "./Middlewares/SetTokens";
import {ApolloServerPluginLandingPageGraphQLPlayground} from "apollo-server-core"
import {REDIS_URL, PORT} from "./config"

const main = async () => {


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
      resolvers: [UserResolver, AuthResolver],
      authChecker: TKAuthChecker,
      dateScalarMode: "timestamp"
    }),
    context: ({req, res}) => ({
      user: req.user,
      res,
      redis
    }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground(),
    ]
  });


  await apolloServer.start();
  apolloServer.applyMiddleware({app, path: "/graphql"});


  app.listen(PORT, () => {
    console.log(`>Server running on port ${PORT}`);
  });

}

main();
