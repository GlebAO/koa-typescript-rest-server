import Koa from "koa";
import { getRepository, Repository, getCustomRepository } from "typeorm";
import {
  hashPassword,
  validateEmail,
  createToken,
  tokenPayloadInterface,
  verifyPassword,
} from "../uitls";
import { User, UserStatus, UserRole } from "../models";
import HttpStatus from "http-status-codes";
import jwtDecode from "jwt-decode";
import { UsersRepository } from "../repository/UsersRepository";
import cryptoRandomString from "crypto-random-string";

type UserDataType = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  accept: boolean | undefined;
  hash: string;
};

interface decodedTokenInterface extends tokenPayloadInterface {
  exp: number;
}

export const signup = async (ctx: Koa.Context): Promise<void> => {
  try {
    const { name, email, accept, password } = ctx.request.body;

    if (password.length < 8) {
      ctx.throw(HttpStatus.BAD_REQUEST, "Wrong pasword format");
    }
    const hashedPassword = await hashPassword(password);
    const randomString = cryptoRandomString({ length: 32, type: 'url-safe' });;

    const userData: UserDataType = {
      email: email.toLowerCase(),
      name,
      accept,
      password: hashedPassword,
      role: UserRole.GUEST,
      status: UserStatus.INACTIVE,
      hash: randomString
    };

    if (!validateEmail(userData.email)) {
      ctx.throw(HttpStatus.BAD_REQUEST, "Wrong email format");
    }
    if (!userData.accept) {
      ctx.throw(HttpStatus.BAD_REQUEST, "You should accept the terms of policy");
    }

    const userRepo: Repository<User> = getRepository(User);
    const existingEmail = await userRepo.findOne({ email: userData.email });
    if (existingEmail) {
      ctx.throw(HttpStatus.BAD_REQUEST, "Email already exists");
    }

    const newUser: User = userRepo.create(userData);
    const savedUser = await userRepo.save(newUser);

    if (savedUser) {

      //const token = createToken(savedUser);
      // const decodedToken = jwtDecode<decodedTokenInterface>(token);
      //const expiresAt = decodedToken.exp;
      // const { name, email, role, id } = savedUser;
      //const userInfo = {
      //  sub: id,
      //  name,
      // email,
      //  role,
      // };
      // ctx.cookies.set("token", token, {
      //  httpOnly: true,
      //  expires: new Date(expiresAt * 1000),
      //secure: true,
      //sameSite: "strict",
      //  });

      ctx.mailer({
        to: savedUser.email,
        subject: 'GSweb - подтверждение email',
        html: `<a href="http://localhost:3000/signup/confirm?token=${randomString}"></a>`,
      }, (error: Error, info: any) => {
        if (error) {
          console.log(error);
        }
        console.log('Message sent: %s', info);
      });

      ctx.body = {
        message: `Регистрация успешно завершена! На почту ${savedUser.email} отправлена ссылка для активации аккаунта.`,
        //userInfo,
        //expiresAt,
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

export const login = async (ctx: Koa.Context): Promise<void> => {
  try {
    const { email, password } = ctx.request.body;

    if (!validateEmail(email) || password.length < 8) {
      ctx.throw(HttpStatus.FORBIDDEN, "Wrong email or password.");
    }

    const userRepo: Repository<User> = getRepository(User);
    const user = await userRepo.findOne({ email: email });
    if (!user) {
      ctx.throw(HttpStatus.FORBIDDEN, "Wrong email or password");
    }

    if (user.status === UserStatus.DELETED) {
      ctx.throw(HttpStatus.FORBIDDEN, "User blocked");
    }
    if (user.status !== UserStatus.ACTIVE) {
      ctx.throw(HttpStatus.FORBIDDEN, "Ваш аккаунт не подтвержден.");
    }

    const passwordValid = await verifyPassword(password, user.password);

    if (passwordValid) {

      const token = createToken(user);
      const decodedToken = jwtDecode<decodedTokenInterface>(token);
      const expiresAt = decodedToken.exp;
      const { name, email, role, id } = user;
      const userInfo = {
        sub: id,
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

      await userRepo.update(
        { id: user.id },
        { lastLoggedIn: Math.floor(Date.now() / 1000) },
      );

      ctx.body = {
        message: "Вход успешно выполнен!",
        userInfo,
        expiresAt,
      };
    } else {
      ctx.throw(HttpStatus.FORBIDDEN, "Wrong email or password.");
    }
  } catch (err) {
    ctx.throw(HttpStatus.BAD_REQUEST, err.message);
  }
};

export const emailConfirm = async (ctx: Koa.Context): Promise<void> => {
  const { token } = ctx.request.query;

  if (token && token.length !== 32) {
    ctx.throw(HttpStatus.FORBIDDEN, "Wrong email confirm token.");
  }

  const userRepo: Repository<User> = getRepository(User);
  const user = await userRepo.findOne({ hash: token });

  if (!user) {
    ctx.throw(HttpStatus.FORBIDDEN, "There was a problem to confirm email.");
  }

  if (user.status === UserStatus.ACTIVE || user.status === UserStatus.DELETED) {
    ctx.throw(HttpStatus.FORBIDDEN, "Email already confirmed");
  }

  await userRepo.update(
    { id: user.id },
    { status: UserStatus.ACTIVE, hash: undefined },
  );

  ctx.body = {
    message: "Email успешно подтвержден! Теперь Вы можете войти на сайт.",
  };
}

export const getUsers = async (ctx: Koa.Context): Promise<void> => {
  if (ctx.user.role !== UserRole.ADMIN) {
    ctx.throw(HttpStatus.FORBIDDEN, "Недостаточно прав");
  }
  const { page, perPage } = ctx.request.query;
  const usersRepository = getCustomRepository(UsersRepository);
  const users = await usersRepository.filterPostsWithPagination(page, perPage);

  ctx.body = {
    users
  };
}

export const updateUser = async (ctx: Koa.Context): Promise<void> => {
  const userId = parseInt(ctx.params.userId);
  const { role, status } = ctx.request.body;

  if (ctx.user.role !== UserRole.ADMIN) {
    ctx.throw(HttpStatus.FORBIDDEN, "У Вас нет прав");
  }

  const values = {};

  const roles = [UserRole.ADMIN, UserRole.USER, UserRole.GUEST];
  if (role) {
    if (!roles.includes(role)) {
      ctx.throw(HttpStatus.BAD_REQUEST, "Такой роли не существует");
    }
    Object.assign(values, { role })
  }
  console.log(status)
  const statuses = [UserStatus.ACTIVE, UserStatus.DELETED, UserStatus.INACTIVE];
  if (status !== undefined) {
    if (!statuses.includes(status)) {
      ctx.throw(HttpStatus.BAD_REQUEST, "Такого статуса не существует");
    }
    Object.assign(values, { status })
  }



  if (Object.keys(values).length === 0) {
    ctx.throw(HttpStatus.BAD_REQUEST, "Нет значений");
  }

  const userRepo: Repository<User> = getRepository(User);
  await userRepo.update(
    { id: userId },
    { ...values },
  );

  const updatedUser = await userRepo.findOne(userId);

  ctx.body = {
    user: updatedUser
  };
}
