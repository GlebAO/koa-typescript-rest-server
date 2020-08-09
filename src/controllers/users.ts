import Koa from "koa";
import { getRepository, Repository } from "typeorm";
import {
  hashPassword,
  validateEmail,
  createToken,
  tokenPayloadInterface,
} from "../uitls";
import { User, UserStatus, UserRole } from "../models";
import HttpStatus from "http-status-codes";
import jwtDecode from "jwt-decode";

type UserDataType = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

interface decodedTokenInterface extends tokenPayloadInterface {
  exp: number;
}

export const signup = async (ctx: Koa.Context): Promise<void> => {
  try {
    const { name, email } = ctx.request.body;
    const hashedPassword = await hashPassword(ctx.request.body.password);

    const userData: UserDataType = {
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      role: UserRole.GUEST,
      status: UserStatus.INACTIVE,
    };

    if (!validateEmail(userData.email)) {
      ctx.throw(HttpStatus.BAD_REQUEST, "Wrong email format");
    }

    const userRepo: Repository<User> = getRepository(User);
    const existingEmail = await userRepo.findOne({ email: userData.email });
    if (existingEmail) {
      ctx.throw(HttpStatus.BAD_REQUEST, "Email already exists");
    }

    const newUser: User = userRepo.create(userData);
    const savedUser = await userRepo.save(newUser);

    if (savedUser) {
      const token = createToken(savedUser);
      const decodedToken = jwtDecode<decodedTokenInterface>(token);
      const expiresAt = decodedToken.exp;

      const { name, email, role } = savedUser;

      const userInfo = {
        name,
        email,
        role,
      };

      ctx.cookies.set("token", token, {
        httpOnly: true,
        expires: new Date(expiresAt * 1000),
        //secure: true,
        //sameSite: "strict",
      });

      ctx.body = {
        message: "Регистрация успешно завершена!",
        userInfo,
        expiresAt,
      };
    } else {
      ctx.throw(
        HttpStatus.BAD_REQUEST,
        "There was a problem creating your account"
      );
    }
  } catch (err) {
    ctx.throw(HttpStatus.BAD_REQUEST, err.message);
  }
};
