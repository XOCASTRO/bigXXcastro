# Pre-Deployment Checklist

Use this checklist to ensure everything is ready before running on your laptop.

## System Requirements
- [ ] Node.js v18+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] MySQL 8.0+ installed and running
- [ ] Port 3000 is available (or you can use different port)

## Database Setup
- [ ] MySQL server is running
- [ ] Schema created: `mysql -u root -p < mysql-schema.sql`
- [ ] Database initialized: `node scripts/init-db.js`
- [ ] Can connect to MySQL with `mysql -u root`

## Project Setup
- [ ] Project files downloaded/copied to your laptop
- [ ] All files are present in project root
- [ ] `.env.local` file created with MySQL credentials
- [ ] Dependencies installed: `pnpm install` (completed successfully)

## Configuration
- [ ] MYSQL_HOST is set to localhost (or your MySQL server)
- [ ] MYSQL_USER matches your MySQL username
- [ ] MYSQL_PASSWORD matches your MySQL password
- [ ] MYSQL_DATABASE is set to clinic_db

## Verification Before Running
- [ ] `pnpm build` completes without errors
- [ ] All pages compile successfully
- [ ] TypeScript checks pass
- [ ] Console shows no warnings (except expected ones)

## Running Application
- [ ] Start server: `pnpm dev`
- [ ] Open http://localhost:3000
- [ ] Login page appears with dark glassmorphism theme
- [ ] Demo login works: admin@pticlinic.com / admin123
- [ ] Dashboard loads with glass-themed cards
- [ ] All pages accessible from sidebar

## Theme Verification
- [ ] Login page shows frosted glass effect
- [ ] Dark background gradient visible
- [ ] Blue buttons appear correctly
- [ ] Emerald accent colors visible
- [ ] No broken styling
- [ ] Tables and forms properly themed

## Functionality Testing
- [ ] Login form works
- [ ] Dashboard stats display
- [ ] Patient management (add/edit/delete)
- [ ] Appointments page accessible
- [ ] Medical records accessible
- [ ] Reports page loads
- [ ] Sidebar navigation responsive

## Database Operations
- [ ] Can create new patients
- [ ] Can view patient list
- [ ] Can create appointments
- [ ] Can view medical records
- [ ] No database connection errors

## Browser Compatibility
- [ ] Works in Chrome/Edge
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Mobile responsive (test with F12 device tools)

## Performance
- [ ] Page load time acceptable (< 3 seconds)
- [ ] No console errors
- [ ] No lag on interactions
- [ ] Smooth transitions

## Final Checks
- [ ] No sensitive data in code
- [ ] All API routes protected appropriately
- [ ] Error handling working
- [ ] Responsive design verified
- [ ] Theme colors consistent throughout

## Production Ready?
- [ ] All items checked
- [ ] Build passes: `pnpm build`
- [ ] No type errors
- [ ] No console warnings
- [ ] Ready for deployment

---

## Quick Troubleshooting

If something isn't working:

1. **Database connection error:**
   - Verify MySQL is running
   - Check credentials in `.env.local`
   - Ensure clinic_db database exists

2. **Port 3000 in use:**
   - Check: `netstat -an | grep 3000`
   - Use different port: `pnpm dev -- -p 3001`

3. **Dependencies missing:**
   - Clear and reinstall: `rm -rf node_modules && pnpm install`

4. **Build fails:**
   - Check TypeScript errors: `pnpm build` (read error messages)
   - Verify all files are present

5. **Theme not showing:**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Restart dev server: `pnpm dev`

---

## Files to Review

Before deployment, review these key files:

1. **SETUP_INSTRUCTIONS.md** - Complete setup guide
2. **QUICK_START.md** - 5-minute quick start
3. **PROJECT_VERIFICATION.md** - Verification report
4. **.env.local** - Your configuration
5. **mysql-schema.sql** - Database schema

---

**Date Completed:** _______________

**By:** _______________

**Notes:** _______________
