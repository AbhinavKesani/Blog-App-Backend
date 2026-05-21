import { UserTypeModel } from "../models/UserTypeModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const register = async (userObj) => {
  // create document
  const userDoc = new UserTypeModel(userObj);

  // validate
  await userDoc.validate();

  // hash password
  userDoc.password = await bcrypt.hash(userDoc.password, 10);

  // save user
  const created = await userDoc.save();

  // convert to object
  const newUserObj = created.toObject();

  // remove password
  delete newUserObj.password;

  return newUserObj;
};

// authenticate function
export const authenticate = async ({ email, password }) => {
  // find user
  const user = await UserTypeModel.findOne({ email });

  if (!user) {
    const err = new Error("invalid email");
    err.status = 401;
    throw err;
  }

  // compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const err = new Error("invalid password");
    err.status = 401;
    throw err;
  }

  // blocked check
  if (user.isActive === false) {
    const err = new Error("your account is blocked. please contact admin");
    err.status = 403;
    throw err;
  }

  // generate token
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );

  const userObj = user.toObject();

  delete userObj.password;

  return { token, user: userObj };
};