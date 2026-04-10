# HealthBook Testing Documentation

## Overview
Comprehensive testing infrastructure for the HealthBook appointment booking system.

---

## Test Suites

| Type | Tool | Location | Tests |
|------|------|----------|-------|
| **Unit Tests** | Vitest | `client/src/**/__tests__/` | 39+ |
| **E2E Tests** | Playwright | `e2e/` | 19 |
| **Security** | Jest | `tests/security/` | 9 |

---

## Quick Start

```bash
# Run all frontend unit tests
cd client && npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode (development)
npm run test:watch

# Run E2E tests (requires dev server running)
npx playwright test

# Run E2E with UI
npx playwright test --ui

# Install Playwright browsers (first time)
npx playwright install
```

---

## Unit Tests (Vitest)

### Components Tested
| Component | Tests | Status |
|-----------|-------|--------|
| Button | 13 | ✓ Pass |
| Input | 6 | ✓ Pass |
| Modal | 10 | ✓ Pass |
| Card | 10 | ✓ Pass |

### Running Unit Tests
```bash
cd client
npm test                    # All tests
npm test -- src/components  # Component tests only
```

---

## E2E Tests (Playwright)

### Test Files
| File | Coverage |
|------|----------|
| `auth.spec.js` | Login, registration, landing page |
| `booking.spec.js` | Booking wizard, dashboard |
| `admin.spec.js` | Admin dashboard, navigation |

### Configuration
- **Base URL:** http://localhost:5173
- **Projects:** Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Auto-start:** Dev server starts automatically

### Running E2E
```bash
# Run all browsers
npx playwright test

# Run specific browser
npx playwright test --project=chromium

# Run specific file
npx playwright test e2e/auth.spec.js

# Debug mode
npx playwright test --debug
```

---

## Security Tests

### RLS Policy Tests
Location: `tests/security/rls-tests.js`

| Test | Purpose |
|------|---------|
| Anonymous read | Verify RLS blocks unauthenticated reads |
| Anonymous insert | Verify RLS blocks unauthenticated writes |
| Cross-user access | Verify users can't access other users' data |
| Privilege escalation | Verify role changes are blocked |

### Running Security Tests
```bash
# Set environment variables first
export SUPABASE_URL=your_url
export SUPABASE_ANON_KEY=your_key
export SUPABASE_SERVICE_KEY=your_service_key

npm test -- tests/security
```

---

## Coverage Targets

| Metric | Target | Current |
|--------|--------|---------|
| Unit Tests | 80% | ~75% |
| E2E Flows | Critical paths | ✓ |
| Security | All RLS policies | ✓ |

---

## CI/CD Integration

Add to GitHub Actions:
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: cd client && npm test
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

---

## Test Patterns

### Component Test Pattern
```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
    it('renders correctly', () => {
        render(<MyComponent />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
```

### E2E Test Pattern
```javascript
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
});
```
