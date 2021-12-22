import {Redis} from "ioredis";
import jwt from "jsonwebtoken";
import {Request, Response} from "express";
import {JwtPayload} from "jsonwebtoken";
import User from "./Types/User";
import {generateAccessToken, generateRefreshToken} from "./Utils/tokens";
import {__prod__, REFRESH_TOKEN_SECRET} from "./config";

const RequestToken = (redis: Redis) => {

  return async (req: Request, res: Response) => {

    const refresh_token = req.cookies["refresh_token"];
    if (!refresh_token) return res.status(403).json({access_token: null});

    try
    {
      const {userId, token_version} = jwt.verify(refresh_token, REFRESH_TOKEN_SECRET!) as JwtPayload;

      const user = await User.findOne(userId);
      if (!user) return res.status(403).json({access_token: null});

      const actual_token_version_lol = await redis.get(userId);

      if (token_version != actual_token_version_lol) return res.status(403).json({access_token: null});

      let access_token = generateAccessToken({userId: user.id});

      res.cookie('refresh_token',
                 generateRefreshToken({userId, token_version}),
                 {
                    maxAge: 1000 * 60 * 60 * 24 * 31,
                    httpOnly: __prod__,
                    secure: __prod__
                 }
      );

      return res.status(200).json({access_token});

    } catch(e) {
      return res.status(403).json({access_token: null});
    }

  }

}


export default RequestToken;
