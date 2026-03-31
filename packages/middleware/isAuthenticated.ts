import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized! No token provided." });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
      role: "user" | "seller";
    };

    if (!decoded) {
      return res.status(403).json({ message: "Forbidden! Invalid token." });
    }

    const account = await prisma.users.findUnique({
      where: { id: decoded.userId },
    });

    req.user = account;

    if (!account) {
      return res
        .status(401)
        .json({ message: "Unauthorized! No User/Seller found!" });
    }
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized! Token expired or invalid." });
  }
};

export default isAuthenticated;
