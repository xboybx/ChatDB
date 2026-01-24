export function sanitizeQuery(query) {
  if (typeof query !== 'string') return '';

  const dangerousPatterns = [
    /DROP\s+TABLE/gi,
    /DELETE\s+FROM/gi,
    /TRUNCATE/gi,
    /ALTER\s+TABLE/gi,
    /CREATE\s+TABLE/gi,
  ];

  let sanitized = query;

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(sanitized)) {
      throw new Error('Query contains dangerous operations');
    }
  });

  return sanitized;
}

export function parseCSVLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export function normalizeColumnName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 63);
}

export function inferColumnType(values) {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');

  if (nonNullValues.length === 0) return 'text';

  const allNumbers = nonNullValues.every(v => !isNaN(v) && v !== '');
  if (allNumbers) return 'number';

  const allDates = nonNullValues.every(v => !isNaN(Date.parse(v)));
  if (allDates) return 'date';

  return 'text';
}

export function formatQueryResult(result) {
  if (Array.isArray(result)) {
    return result.slice(0, 1000);
  }
  return [result];
}

export function truncateText(text, length = 100) {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function extractTableName(connectionString) {
  try {
    const url = new URL(`postgres://${connectionString}`);
    return url.pathname.slice(1).split('/')[0];
  } catch {
    const match = connectionString.match(/\/([^/?]+)(?:\?|$)/);
    return match ? match[1] : 'unknown';
  }
}

export function validateConnectionString(connectionString, type) {
  if (!connectionString || typeof connectionString !== 'string') {
    throw new Error('Invalid connection string');
  }

  if (type === 'sql') {
    if (!connectionString.includes('://')) {
      throw new Error('Invalid SQL connection string format');
    }
  } else if (type === 'mongodb') {
    if (!connectionString.startsWith('mongodb')) {
      throw new Error('Invalid MongoDB connection string format');
    }
  }
}
