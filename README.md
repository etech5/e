# E-TECH Website - GitHub Pages Ready

## Overview
This is a complete static website for E-TECH with an admin dashboard, ready to be uploaded to GitHub Pages.

## Features
- **Main Website**: Modern, responsive design with animations
- **Admin Dashboard**: Separate admin panel with full control
- **Data Management**: All data stored in browser localStorage
- **Real Admin Login**: Secure password authentication
- **Content Management**: Add/edit/delete services, portfolio, testimonials, blog posts
- **Message Management**: View and manage contact messages
- **Subscriber Management**: Export subscribers to CSV
- **Site Settings**: Update contact info and site details
- **Admin Account**: Change admin name, email, and password

## File Structure
```
etech-website/
├── index.html              # Main website homepage
├── admin/
│   └── index.html          # Admin dashboard (separate page)
├── pages/
│   ├── about.html
│   ├── services.html
│   ├── portfolio.html
│   ├── pricing.html
│   ├── blog.html
│   ├── contact.html
│   ├── educational-platforms.html
│   ├── ecommerce-solutions.html
│   └── mobile-applications.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
```

## How to Upload to GitHub Pages

### 1. Create a GitHub Repository
1. Go to GitHub and create a new repository
2. Name it `etech-website` (or any name you prefer)
3. Make it public

### 2. Upload Files
1. Download all files from the `etech-website` folder
2. Upload all files to your GitHub repository
3. Make sure the file structure is preserved

### 3. Enable GitHub Pages
1. Go to repository Settings
2. Scroll down to "Pages" section
3. Under "Source", select "Deploy from a branch"
4. Select "main" branch and "/ (root)" folder
5. Click Save
6. Your site will be live at: `https://yourusername.github.io/etech-website/`

## Admin Access

### Default Login Credentials
- **Email**: admin@etech.com
- **Password**: admin123

### Accessing Admin Dashboard
1. Go to: `https://yourusername.github.io/etech-website/admin/`
2. Enter the login credentials
3. You will be redirected to the admin dashboard

### Changing Admin Password
1. Login to admin dashboard
2. Go to "Admin Account" section
3. Enter current password
4. Enter new password and confirm
5. Click "Update Account"

## Important Notes

### Data Storage
- All data is stored in the browser's localStorage
- Each user/browser will have their own separate data
- To share data across devices, you need a backend server
- For production use, consider implementing a real database

### Security
- This is a client-side only solution
- The admin password is stored in localStorage (visible to anyone with browser access)
- For production, implement server-side authentication
- Consider adding additional security measures

### Customization
- Edit site settings in admin dashboard
- Add/edit content through admin panel
- All changes are saved in localStorage
- Changes will persist on the same browser/device

## Support
For any issues or questions, please contact the developer.

## License
All rights reserved. E-TECH 2026.
