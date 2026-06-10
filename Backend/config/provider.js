import { ethers } from "ethers";
import { config } from "dotenv";
config();

export const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
