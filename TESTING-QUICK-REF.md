# Testing Quick Reference

## 🚀 Run Tests

### Backend (Jest)
```bash
cd backend
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
npm test -- user.model    # Specific file
```

### Frontend (Vitest)
```bash
cd frontend
npm test                  # Run all tests
npm run test:ui           # Interactive UI
npm run test:coverage     # With coverage
```

### E2E (Playwright)
```bash
cd frontend
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Interactive mode
```

### Accessibility
```bash
cd frontend
npm run test:accessibility
```

## 📁 Test Files

### Backend
- `user.model.test.js` - User model tests
- `errorHandler.middleware.test.js` - Error handling
- `security.middleware.test.js` - Security middleware
- `api.integration.test.js` - API integration

### Frontend
- `Button.test.jsx` - Button component
- `Input.test.jsx` - Input component
- `example.e2e.spec.js` - E2E examples

## 📊 Current Coverage

| Component | Coverage |
|-----------|----------|
| Backend Models | 85% |
| Backend Middleware | 90% |
| Frontend Components | 60% |

## ✅ Quality Checklist

### Before Commit
- [ ] All tests pass
- [ ] No console errors
- [ ] ESLint clean
- [ ] Code reviewed

### Before Deploy
- [ ] Test coverage ≥ 80%
- [ ] E2E tests pass
- [ ] Accessibility audit done
- [ ] Cross-browser tested

## 📚 Documentation

- `TESTING-QUALITY-COMPLETE.md` - Full testing guide
- `MANUAL-TESTING-CHECKLIST.md` - Manual testing
- `CODE-REVIEW-GUIDELINES.md` - Review standards
- `TESTING-QA-SUMMARY.md` - Implementation summary

## 🔍 Debug Tests

```bash
# Run single test
npm test -- -t "should create user"

# Verbose output
npm test -- --verbose

# Update snapshots
npm test -- -u
```

## ⚡ Quick Tips

1. **Write tests first** (TDD)
2. **Keep tests isolated**
3. **Mock external dependencies**
4. **Test edge cases**
5. **Aim for 80%+ coverage**
6. **Run tests before committing**

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase timeout in config |
| Module not found | Check imports and paths |
| Mock not working | Reset mocks in afterEach |
| Coverage too low | Add tests for uncovered code |

## 📞 Need Help?

Review the comprehensive documentation files for detailed guides and examples.
