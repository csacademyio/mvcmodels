import redisClient from "./client";
import * as connectRedis from "connect-redis"
import session from "express-session"


/**
 * @description We can handle user sessions via redis
 *              to optimisation because as I have taught 
 *              redis stores session data in the memory (RAM)
 *              rather than with disk-based storage (HDD or SDD) 
 */


const RedisStore = new connectRedis.RedisStore(session)