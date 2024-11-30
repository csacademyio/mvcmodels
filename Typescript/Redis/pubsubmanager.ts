import redisClient from "./client";
import * as connectRedis from "connect-redis";
import session from "express-session";
import {createClient} from "redis"

/**
 * @description We can handle user sessions publish/subscribe (pub/sub)
 *              message architecture pattern
 *              between different aspects of our api system
 * 
 * @description When we are building real-time applications
 *              using the built-in pub/sub system in redis issue
 */


const publisher = createClient()
const subscriber = createClient()

(async () => )



