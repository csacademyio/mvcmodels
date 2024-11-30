import { createClient } from "redis";
import Redis from "ioredis";

const redisClient = createClient();

/**
 * @description We will be using our redis client throughout are application
 *              to handle different areas of activity.
 *
 */
class RedisClient {
  private static instance: Redis;

  public static getClient(): Redis {
    //Check if we already have a Redis Client instances
    //If not then we can create an instance
    //This is the singleton pattern of writing code
    //This way we can reuse the same client
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        //REMEBER you need hosturl, port and password to be able to use redis
        host: process.env.REDIS_HOST_URL || "127.0.0.0",
        port: Number(process.env.REDIS_PORT) || 6379, //6379 is usual port
        password: process.env.REDIS_PASSWORD || undefined,
      });

      //Adding an event listener for the instance to signal that the server is on
      RedisClient.instance.on("connect", () => {
        console.log("Connected to Redis");
      });

      //Handling the Error,
      RedisClient.instance.on("error", (err) => {
        console.error("Redis Error: ", err);
      });
    }
    return RedisClient.instance;
  }

  //time-to-live (ttl) is feature that we can use here to
  //allow for expiry time of sessions
  public static async set(
    key: string,
    value: string,
    ttlInSeconds: number = 3600 //Default to 1ho
  ): Promise<void> {
    const client = RedisClient.getClient(); //G
    await client.set(key, value, "EX", ttlInSeconds); //EX = seconds
    //for the list of gets https://redis.io/docs/latest/commands/set/
  }

  //get session
  public static async get(key: string): Promise<string | null> {
    const client = RedisClient.getClient();
    return await client.get(key);
  }

  //delete session
  public static async del(key: string): Promise<number> {
    const client = RedisClient.getClient();
    return await client.del(key);
  }

  //async deleteCache(cacheName: string): Promise<boolean> {
  //await this._checkReady()
  //return (await this.redis?.del(cacheName)) !== 0
  //}
}

export default redisClient;
