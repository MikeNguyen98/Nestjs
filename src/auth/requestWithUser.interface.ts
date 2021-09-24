/* eslint-disable prettier/prettier */
import { User } from './../module/user/entities/user.entity';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;
