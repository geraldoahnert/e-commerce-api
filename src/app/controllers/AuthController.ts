import { Request, response, Response } from 'express';
import { getRepository } from 'typeorm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import { request } from 'http';

require('dotenv/config');

class AuthController {
  async authenticate(req: Request, res: Response) {
    const repository = getRepository(User);

    const { email, password } = req.body;

    const user = await repository.findOne({ where: { email } });

    if (!user) {
      return res.sendStatus(401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.sendStatus(401);
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_KEY, {
      expiresIn: '1d',
    });

    delete user.password;

    return response.json({
      user,
      token,
    });
  }
}

export default new AuthController();