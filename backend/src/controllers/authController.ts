import { Request, Response } from 'express';
import User from '../models/User'; // Using your existing User model
import jwt from 'jsonwebtoken';

// This function creates the JWT token
const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      // --- FIX: Removed 'return' ---
      res.status(400).json({ msg: 'User already exists' });
      return; // Exit function
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({
      state: 201,
      msg: 'User registered successfully',
      data: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        token: generateToken(user.id, user.role) 
      }
    });
  } catch (error: any) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    
    if (user && (await user.comparePassword(password))) {
      res.json({
        state: 200,
        msg: 'Login successful',
        data: { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          token: generateToken(user.id, user.role) 
        }
      });
    } else {
      // --- FIX: Removed 'return' ---
      res.status(401).json({ state: 401, msg: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};