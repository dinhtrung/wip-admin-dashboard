---
name: Ory Kratos User Self-Service Pages Implementation
about: Implement user registration, login, password reset, and profile management pages
title: "Feature: Ory Kratos User Self-Service Pages"
labels: enhancement, auth, frontend
assignees: ''
---

## Summary
Implement the complete set of user self-service pages using Ory Kratos for authentication management. These pages will handle user registration, login, password reset, and profile management flows.

## Technical Requirements

### Pages to Implement
1. **Registration Page** (`/register`)
   - Email/password registration form
   - Social login options (Google, GitHub, etc.)
   - Account verification flow
   - Handle Kratos registration flow via API

2. **Login Page** (`/login`)
   - Email/password login form
   - Social login options
   - Remember me functionality
   - Forgot password link
   - Handle Kratos login flow via API

3. **Password Reset Page** (`/reset-password`)
   - Email input for reset request
   - Verification code input
   - New password form
   - Handle Kratos recovery flow via API

4. **Profile Management Page** (`/profile`)
   - View/edit user profile information
   - Change password functionality
   - Linked identities management
   - Account deletion option
   - Handle Kratos settings flow via API

5. **Verification Page** (`/verify`)
   - Email verification flow
   - Account activation
   - Handle Kratos verification flow via API

### Technical Implementation Details

#### API Integration
- Use the Kratos Public API for all authentication flows
- Implement proper session management with cookies
- Handle Kratos' form-based flows (not redirect-based)
- Implement CSRF protection

#### Components Structure
```
src/
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       ├── PasswordResetForm.tsx
│       ├── ProfileSettings.tsx
│       └── VerificationForm.tsx
├── routes/
│   ├── login.tsx
│   ├── register.tsx
│   ├── reset-password.tsx
│   ├── verify.tsx
│   └── profile.tsx
└── hooks/
    └── useKratosFlow.ts
```

#### Kratos Flow Handling
- Create a custom hook `useKratosFlow` to handle Kratos flows
- Handle form rendering dynamically based on Kratos response
- Handle errors and messages from Kratos
- Implement proper form submission handling

#### Styling
- Use existing shadcn/ui components
- Follow the project's Tailwind CSS v4 configuration
- Maintain consistency with existing UI patterns

### TODOs

#### Phase 1: Basic Flows
- [ ] Create `useKratosFlow` hook
- [ ] Implement Login page with basic form
- [ ] Implement Registration page with basic form
- [ ] Test login/register flows with backend
- [ ] Add proper error handling and display

#### Phase 2: Advanced Flows
- [ ] Implement Password Reset flow
- [ ] Implement Email Verification flow
- [ ] Add social login integration
- [ ] Implement Remember Me functionality

#### Phase 3: Profile Management
- [ ] Create Profile Settings page
- [ ] Implement profile update functionality
- [ ] Add password change functionality
- [ ] Implement account deletion flow

#### Phase 4: Polish
- [ ] Add loading states and transitions
- [ ] Implement proper success/error notifications
- [ ] Add unit tests for auth components
- [ ] Accessibility improvements
- [ ] Mobile responsiveness

### Dependencies
- TanStack Router for navigation
- Existing API client setup for Kratos integration
- shadcn/ui components
- Tailwind CSS v4

### Testing Considerations
- Unit tests for auth forms and hooks
- Integration tests for Kratos flow handling
- End-to-end tests for complete user flows
- Test with both valid and invalid inputs
