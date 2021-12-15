import {Redis} from "ioredis";
import jwt from "jsonwebtoken";
import {Request, Response, NextFunction} from "express";
import {JwtPayload} from "jsonwebtoken";
import User from "../Types/User";
import {Payload, generateAccessToken, generateRefreshToken} from "../Utils/tokens";

const SetTokens = (redis: Redis) => {

  return async (req: Request, res: Response, next: NextFunction) => {

    let token: string | null = null;
    if (req.headers && req.headers.authorization)
    {
      let parts = req.headers.authorization.split(' ');
      if (parts.length == 2 && /^Bearer$/i.test(parts[0]))
        token = parts[1];
    }

    if (!token) return next(); 

    const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = process.env;
    try
    {
      const user = jwt.verify(token, ACCESS_TOKEN_SECRET!) as JwtPayload;
      req["user"] = user;

    } catch(e) {

      const refresh_token = req.cookies["refresh_token"];
      if (!refresh_token) return next();

      try
      {
        const {userId, token_version} = jwt.verify(refresh_token, REFRESH_TOKEN_SECRET!) as JwtPayload;

        const user = await User.findOne(userId);
        if (!user) return next();

        const actual_token_version_lol = await redis.get(userId);

        if (token_version != actual_token_version_lol) return next();

        let payload: Payload = {userId: user.id, admin: user.admin};

        res.set("x-access-token", generateAccessToken(payload));

        res.cookie('refresh_token',
                   generateRefreshToken({userId, token_version}),
                   {
                      maxAge: 1000 * 60 * 60 * 24 * 31,
                      httpOnly: true,
                   }
        );

        req["user"] = payload;


      } catch(e) {
        return next();
      }

    }

    return next();
  }

}


export default SetTokens;
