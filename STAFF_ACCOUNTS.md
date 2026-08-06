# Staff Account Credentials

## Initial Setup

All seeded staff accounts in `src/data/db.json` have been configured with a secure initial password for development and testing purposes.

### Staff Accounts

The following staff accounts are available:

- `owner@solcart.io` - Owner role
- `superadmin@solcart.io` - Super Admin role
- `finance@solcart.io` - Finance Manager role
- `ops@solcart.io` - Operations Manager role
- `support@solcart.io` - Customer Support role
- `fulfillment@solcart.io` - Fulfillment Manager role
- `analyst@solcart.io` - Read-Only Analyst role

### Initial Password

**Password:** `admin`

**IMPORTANT SECURITY NOTICE:**
- This password is for **DEVELOPMENT AND TESTING ONLY**
- In production environments, immediately change all staff account passwords using the password reset functionality
- Never use default passwords in production
- Each staff member should set a unique, strong password

### Changing Passwords

Staff members can change their passwords using the "Forgot Password" feature:
1. Click "Forgot Password" on the login page
2. Enter your staff email address
3. Check your email for the reset code
4. Enter the code and set a new secure password

### Security Best Practices

1. **Change default passwords immediately** after initial setup
2. Use strong, unique passwords for each account
3. Enable two-factor authentication if available
4. Regularly rotate passwords
5. Never share account credentials
6. Use password managers to generate and store secure passwords

---

**Note:** The password hash stored in the database is: `8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918` (SHA-256 hash of "admin")
