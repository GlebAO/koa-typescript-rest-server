import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Timestamp } from "typeorm";
import { User, UserRole } from "./models";

const hashPassword = (password: string) => {
  return new Promise<string>((resolve, reject) => {
    // Generate a salt at level 12 strength
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

const validateEmail = (email: string): boolean => {
  const tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

  if (!email) return false;

  if (email.length > 256) return false;

  if (!tester.test(email)) return false;

  var [account, address] = email.split("@");
  if (account.length > 64) return false;

  var domainParts = address.split(".");
  if (
    domainParts.some(function (part) {
      return part.length > 63;
    })
  ) {
    return false;
  }

  return true;
};

interface tokenPayloadInterface {
  sub: number;
  email: string;
  role: UserRole;
  iss: string;
  aud: string;
}

const createToken = (user: User) => {
  const secret = process.env.JWT_SECRET;
  // Sign the JWT
  if (!user.role) {
    throw new Error("No user role specified");
  }

  if (!secret) {
    throw new Error("No secret specified");
  }

  const tokenPayload: tokenPayloadInterface = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iss: "api.gsweb.ru",
    aud: "api.gsweb.ru",
  };

  return jwt.sign(tokenPayload, secret, {
    algorithm: "HS384",
    expiresIn: process.env.COOKIE_EXPIRES_IN,
  });
};

const verifyPassword = (
  passwordAttempt: string,
  hashedPassword: string
) => {
  return bcrypt.compare(passwordAttempt, hashedPassword);
};

const formatDate = function (date: Date | Timestamp | string) {

  const d = date instanceof Date ?
        date : new Date(typeof date !== 'string' ? 
            date.toString() : date);

  const arr =  [
    '0' + d.getHours(),
    '0' + d.getMinutes(),
    '0' + d.getDate(),
    '0' + (d.getMonth() + 1),
  ].map(component => component.slice(-2)); // взять последние 2 цифры из каждой компоненты

  arr.push('' + d.getFullYear());

  return arr;
}

const getFormattedDate = function (date: Timestamp | string | Date, dateDelim: string) {
  const formatted = formatDate(date).slice(2).reverse();
  return formatted.join(dateDelim);  // for time --> + ' ' + d.slice(0, 2).join(':')
}

export { hashPassword, validateEmail, createToken, verifyPassword, formatDate, getFormattedDate, tokenPayloadInterface };
