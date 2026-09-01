// Request augmentation: `requireAuth` populates `req.userId`.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};
