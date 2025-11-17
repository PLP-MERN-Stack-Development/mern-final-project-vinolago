# Code Review Guidelines

## Purpose

This document outlines the standards and best practices for code reviews in our MERN escrow application project.

---

## Review Process

### When to Request a Review

- [ ] All tests pass locally
- [ ] Code is self-reviewed
- [ ] No console errors/warnings
- [ ] Documentation updated
- [ ] Commit messages are clear

### Review Timeline

- **Urgent**: Within 4 hours
- **Normal**: Within 24 hours
- **Low Priority**: Within 48 hours

---

## Review Checklist

### General Code Quality

#### Readability
- [ ] Code is self-documenting
- [ ] Complex logic has comments
- [ ] Variable names are descriptive
- [ ] Functions have single responsibility
- [ ] No deeply nested code (max 3 levels)

#### Consistency
- [ ] Follows project style guide
- [ ] Naming conventions consistent
- [ ] File structure follows patterns
- [ ] Similar code uses same patterns

#### Maintainability
- [ ] DRY (Don't Repeat Yourself)
- [ ] Functions are < 50 lines
- [ ] Files are < 300 lines
- [ ] Clear separation of concerns
- [ ] Easy to extend/modify

---

### React/Frontend Specific

#### Components
```javascript
// ✅ Good
function TransactionCard({ transaction, onView }) {
  return (
    <Card>
      <h3>{transaction.title}</h3>
      <Button onClick={() => onView(transaction.id)}>
        View Details
      </Button>
    </Card>
  );
}

// ❌ Bad
function TransactionCard(props) {
  const t = props.transaction;
  return <div onClick={props.onView}>{t.title}</div>;
}
```

#### Hooks
```javascript
// ✅ Good - Proper dependencies
useEffect(() => {
  fetchTransactions(userId);
}, [userId]);

// ❌ Bad - Missing dependencies
useEffect(() => {
  fetchTransactions(userId);
}, []);

// ✅ Good - Custom hook
function useTransaction(id) {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTransaction(id).then(setTransaction);
    setLoading(false);
  }, [id]);
  
  return { transaction, loading };
}
```

#### State Management
```javascript
// ✅ Good - Functional updates
setCount(prev => prev + 1);

// ❌ Bad - Direct state mutation
count++;
setState(count);

// ✅ Good - Immutable updates
setUser(prev => ({ ...prev, name: 'John' }));

// ❌ Bad - Mutation
user.name = 'John';
setUser(user);
```

#### Performance
```javascript
// ✅ Good - Memoization
const expensiveResult = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ Good - Callback memoization
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// ❌ Bad - New function every render
<Button onClick={() => doSomething(id)} />
```

---

### Node.js/Backend Specific

#### Route Handlers
```javascript
// ✅ Good
router.post('/transactions', requireAuth, async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    
    // Emit real-time event
    emitTransactionUpdate(transaction.id, transaction);
    
    res.status(201).json({
      success: true,
      transaction
    });
  } catch (error) {
    logger.error('Transaction creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction'
    });
  }
});

// ❌ Bad
router.post('/transactions', async (req, res) => {
  const transaction = await Transaction.create(req.body);
  res.json(transaction);
});
```

#### Database Queries
```javascript
// ✅ Good - Optimized query
const transactions = await Transaction.find({ userId })
  .select('id title amount status')
  .limit(20)
  .lean();

// ❌ Bad - N+1 query
const transactions = await Transaction.find();
for (const tx of transactions) {
  tx.user = await User.findById(tx.userId);
}

// ✅ Good - Populate
const transactions = await Transaction.find()
  .populate('user', 'name email');
```

#### Error Handling
```javascript
// ✅ Good
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// ❌ Bad
router.get('/transactions', async (req, res) => {
  const data = await Transaction.find();
  res.json(data);
});
```

---

### Security Checklist

#### Authentication/Authorization
- [ ] All protected routes have auth middleware
- [ ] User permissions checked
- [ ] JWT tokens validated
- [ ] Session management secure
- [ ] No hardcoded credentials

#### Input Validation
- [ ] All user input validated
- [ ] SQL/NoSQL injection prevented
- [ ] XSS prevention in place
- [ ] File upload restrictions
- [ ] Rate limiting on sensitive endpoints

#### Data Protection
- [ ] Passwords hashed (bcrypt)
- [ ] Sensitive data encrypted
- [ ] No sensitive data in logs
- [ ] HTTPS enforced
- [ ] CORS configured correctly

#### Example Security Review
```javascript
// ❌ Bad - No validation
router.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

// ✅ Good - Validated and sanitized
router.post('/users', requireAuth, async (req, res) => {
  const { email, password, name } = req.body;
  
  // Validate
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password required'
    });
  }
  
  // Sanitize
  const sanitizedEmail = sanitize(email);
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await User.create({
    email: sanitizedEmail,
    password: hashedPassword,
    name: sanitize(name)
  });
  
  // Don't return password
  const { password: _, ...userWithoutPassword } = user.toObject();
  
  res.status(201).json({
    success: true,
    user: userWithoutPassword
  });
});
```

---

### Testing Checklist

- [ ] Unit tests added for new functions
- [ ] Integration tests for API endpoints
- [ ] Edge cases covered
- [ ] Error cases tested
- [ ] Mocks used appropriately
- [ ] Test coverage maintained/improved

#### Example Test Review
```javascript
// ✅ Good test
describe('Transaction Service', () => {
  it('should create transaction with valid data', async () => {
    const data = {
      title: 'Test Transaction',
      amount: 1000,
      buyerId: 'buyer123'
    };
    
    const transaction = await createTransaction(data);
    
    expect(transaction).toBeDefined();
    expect(transaction.title).toBe(data.title);
    expect(transaction.amount).toBe(data.amount);
  });
  
  it('should throw error for invalid amount', async () => {
    const data = {
      title: 'Test',
      amount: -100, // Invalid
      buyerId: 'buyer123'
    };
    
    await expect(createTransaction(data)).rejects.toThrow();
  });
});

// ❌ Bad test - Not isolated
it('should work', async () => {
  const tx = await Transaction.create({});
  expect(tx).toBeTruthy();
});
```

---

### Performance Checklist

#### Frontend
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading for routes
- [ ] Debouncing/throttling used
- [ ] No memory leaks

#### Backend
- [ ] Database queries optimized
- [ ] Indexes on frequently queried fields
- [ ] Pagination implemented
- [ ] Caching where appropriate
- [ ] No N+1 queries
- [ ] Connection pooling configured

---

### Documentation Checklist

- [ ] README updated if needed
- [ ] API documentation current
- [ ] Complex code has comments
- [ ] Environment variables documented
- [ ] Setup instructions clear
- [ ] Changelog updated

---

## Common Issues and Solutions

### Issue: Large Component Files

**Problem:**
```javascript
// Component.jsx - 800 lines
function LargeComponent() {
  // Too much logic
}
```

**Solution:**
```javascript
// Split into smaller components
// components/Transaction/index.js
export { TransactionHeader } from './Header';
export { TransactionDetails } from './Details';
export { TransactionActions } from './Actions';

// Transaction.jsx
function Transaction() {
  return (
    <>
      <TransactionHeader />
      <TransactionDetails />
      <TransactionActions />
    </>
  );
}
```

### Issue: Repeated API Calls

**Problem:**
```javascript
// Multiple places
axios.get('/api/transactions')
axios.post('/api/transactions', data)
```

**Solution:**
```javascript
// services/transactionService.js
export const transactionService = {
  getAll: () => api.get('/transactions'),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
};

// Usage
import { transactionService } from '@/services/transactionService';
const transactions = await transactionService.getAll();
```

---

## Review Comments Examples

### Constructive Feedback

```
✅ Good:
"Consider extracting this logic into a custom hook for reusability.
Example: const { data, loading } = useTransaction(id)"

❌ Bad:
"This is wrong. Use a hook."
```

```
✅ Good:
"This query could be optimized by adding an index on the 'userId' field.
Would also recommend using .lean() for read-only operations."

❌ Bad:
"Slow query. Fix it."
```

```
✅ Good:
"Great implementation! One suggestion: we could memoize this computed
value to avoid recalculation on every render. WDYT?"

❌ Bad:
"This works but you should use useMemo."
```

---

## Approval Criteria

### Must Have (Blocking)
- [ ] No breaking changes
- [ ] All tests pass
- [ ] No security vulnerabilities
- [ ] No performance regressions
- [ ] Follows coding standards

### Should Have (Request Changes)
- [ ] Code is well-documented
- [ ] Error handling is comprehensive
- [ ] Edge cases are handled
- [ ] Performance is optimized

### Nice to Have (Suggestions)
- [ ] Additional test coverage
- [ ] Performance improvements
- [ ] Code simplifications
- [ ] Better naming

---

## Sign-off

**Reviewer**: ________________
**Date**: ________________
**Status**: [ ] Approved  [ ] Changes Requested  [ ] Rejected

**Comments:**
________________________________
________________________________
________________________________
