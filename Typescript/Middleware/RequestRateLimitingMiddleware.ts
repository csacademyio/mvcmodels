import { Request, Response, NextFunction } from "express";
import redisClient from "../Redis/client";


/**
 * @description Rate Limiting is a key performance enhancer for APIs
 *              To prevent API failure, load balancing issues
 *              In this example we will be using the most used 
 *              system for API performance optimisation
 */

//These variables should set in a config file for production
const MAX_AMOUNT_OF_REQUESTS = 15;//Max number of API request that can be made by the user
const RATE_LIMIT_TIME = 300; //5 mins = 60 seconds * 5, 
//These two variables translate to saying
//Max amount of requests is 15 every 5 minutes


export async function requestRateLimiter(req: Request, res: Response, next: NextFunction){
    //To limit each users request amount
    //we must track their activity via their ip addresses
    const ip = req.ip
    const current = await redisClient.incr(ip!) //we use the increment function to increment the count

    if(current === 1){
        await redisClient.expire(ip!, RATE_LIMIT_TIME, "GT")
    }

    if(current > MAX_AMOUNT_OF_REQUESTS){
        return res.status(429).json({message: "Too many requests"}) //429 = Too many requests
    }

    next()
}
