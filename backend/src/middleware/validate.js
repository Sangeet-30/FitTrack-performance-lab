import mongoose from 'mongoose';

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issues = result.error?.issues || result.error?.errors || [];
    const formattedErrors = issues.map((err) => ({
      field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
      message: err.message,
    }));
    return res.status(400).json({
      message: formattedErrors[0]?.message || 'Invalid request body.',
      errors: formattedErrors,
    });
  }
  req.body = result.data;
  next();
};

export const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const value = req.params[paramName];
  if (!value || !mongoose.Types.ObjectId.isValid(value) || new mongoose.Types.ObjectId(value).toString() !== value) {
    return res.status(400).json({
      message: `Invalid ID parameter '${paramName}'. Must be a 24-character hexadecimal ObjectId string.`,
    });
  }
  next();
};
