import { Response } from 'express';
import Board from '../models/Board';
import Column from '../models/Column';
import Card from '../models/Card';
import { AuthRequest } from '../middleware/auth';

export const getBoards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const boards = await Board.find({
      $or: [
        { userId: req.userId },
        { sharedWith: req.userId }
      ]
    }).sort({ updatedAt: -1 });
    
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.userId },
        { sharedWith: req.userId }
      ]
    });

    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    const columns = await Column.find({ boardId: board._id }).sort({ position: 1 });
    const cards = await Card.find({ boardId: board._id }).sort({ position: 1 });

    res.json({
      board,
      columns,
      cards
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    const board = new Board({
      userId: req.userId,
      name: name || 'My Board'
    });

    await board.save();

    const defaultColumns = [
      { boardId: board._id, title: 'Ideas', position: 0 },
      { boardId: board._id, title: 'In Progress', position: 1 },
      { boardId: board._id, title: 'Completed', position: 2 }
    ];

    await Column.insertMany(defaultColumns);

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, sharedWith } = req.body;

    const board = await Board.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    if (name) board.name = name;
    if (sharedWith !== undefined) board.sharedWith = sharedWith;

    await board.save();

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBoard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    await Card.deleteMany({ boardId: board._id });
    await Column.deleteMany({ boardId: board._id });
    await Board.findByIdAndDelete(board._id);

    res.json({ message: 'Board deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
