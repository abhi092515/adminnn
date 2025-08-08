import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/User';

// Extend Express Request type to include the user property
export interface ProtectedRequest extends Request {
  user?: IUser;
}

export const protect = async (req: ProtectedRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      
      // Find the user but exclude their hashed password
      req.user = await User.findById(decoded.id).select('-password');

      // --- THIS IS THE FIX ---
      // If user is not found with that ID, then the token is invalid
      if (!req.user) {
         return res.status(401).json({ msg: 'Not authorized, user not found' });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: ProtectedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Forbidden: You do not have permission for this action.' });
    }
    next();
  };
};