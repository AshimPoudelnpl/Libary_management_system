// Validation middleware for common fields

export const validateEmail = (req, res, next) => {
  const { email } = req.body;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  next();
};

export const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    if (missing.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missing.join(", ")}` 
      });
    }
    next();
  };
};

export const validateRole = (req, res, next) => {
  const { role } = req.body;
  const validRoles = ["ADMIN", "LIBRARIAN", "MEMBER"];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ 
      error: `Invalid role. Must be one of: ${validRoles.join(", ")}` 
    });
  }
  next();
};

export const validateStatus = (validStatuses) => {
  return (req, res, next) => {
    const { status } = req.body;
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }
    next();
  };
};

export const validateYear = (req, res, next) => {
  const { publication_year } = req.body;
  if (publication_year) {
    const year = parseInt(publication_year);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1000 || year > currentYear + 1) {
      return res.status(400).json({ 
        error: "Invalid publication year" 
      });
    }
  }
  next();
};

export const validateDate = (fieldName) => {
  return (req, res, next) => {
    const date = req.body[fieldName];
    if (date) {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({ 
          error: `Invalid date format for ${fieldName}` 
        });
      }
    }
    next();
  };
};

export const validateNumeric = (fieldName) => {
  return (req, res, next) => {
    const value = req.body[fieldName];
    if (value !== undefined && (isNaN(value) || value < 0)) {
      return res.status(400).json({ 
        error: `${fieldName} must be a positive number` 
      });
    }
    next();
  };
};

