export interface SiteConfig {
  // Header / Navbar Details
  brandName: string;
  adminTitle: string;
  logo: string;
  logoFull: string;
  navbarColor: string; // Header / Navbar background color
  navbarTextColor: string; // Navbar text/link color
  navbarTextHoverColor: string; // Navbar text/link hover color

  // Book Installation Button
  bookBtnBg: string; // Book Installation button background color
  bookBtnHoverBg: string; // Book Installation button hover color
  bookBtnText: string; // Book Installation button text color

  // Login Button
  loginBtnBg: string; // Login button background color
  loginBtnHoverBg: string; // Login button hover color
  loginBtnText: string; // Login button text color
  loginBtnBorder: string; // Login button border color

  // Admin User Profile Pill Button
  adminProfileBtnBg: string; // Profile pill background color
  adminProfileBtnHoverBg: string; // Profile pill hover background color
  adminProfileBtnText: string; // Profile pill text & arrow color
  adminProfileBtnBorder: string; // Profile pill border color
  adminProfileBadgeBg: string; // Initial avatar badge background color
  adminProfileBadgeText: string; // Initial avatar badge text color

  // Footer Details
  copyright: string;
  footerAbout: string;

  // Contact Details
  companyName: string;
  phone: string;
  mobile: string;
  whatsapp: string;
  whatsappLink: string;
  email: string;
  address: string;
  workingHours: string;
  website: string;
}

export const SITE_CONFIG: SiteConfig = {
  // Header / Navbar Details
  brandName: 'FitMate',
  adminTitle: 'FitMate',
  logo: 'logo-icon.png',
  logoFull: 'logo.png',
  navbarColor: '#ffff', // Navbar / Header background color (change here anytime)
  navbarTextColor: 'black', // Navbar link / text color
  navbarTextHoverColor: '#ea1f25', // Navbar link hover text color

  // Book Installation Button (Colors & Hover Effects)
  bookBtnBg: '#ea1f25', // Button background color
  bookBtnHoverBg: '#c5161b', // Button hover background color
  bookBtnText: '#ffffff', // Button text / icon color

  // Login Button (Colors & Hover Effects)
  loginBtnBg: '#ea1f25', // Button background color
  loginBtnHoverBg: '#c5161b', // Button hover background color
  loginBtnText: '#ffffff', // Button text / icon color
  loginBtnBorder: '#c5161b', // Button border color

  // Admin User Profile Pill Button (Colors & Hover Effects)
  adminProfileBtnBg: 'transparent', // Button background color
  adminProfileBtnHoverBg: '#fef2f2', // Button hover background color
  adminProfileBtnText: '#1f2937', // Text & arrow color
  adminProfileBtnBorder: '#e5e7eb', // Border color
  adminProfileBadgeBg: '#fee2e2', // Avatar badge background
  adminProfileBadgeText: '#c5161b', // Avatar badge text color

  // Footer Details
  copyright: 'FitMate. All rights reserved.',
  footerAbout: "South India's premier precision steel door supply and certified fitting service network. ISO standard security architectures.",

  // Contact Details
  companyName: 'FitMate Systems Pvt Ltd',
  phone: '+91 1800-425-DOOR',
  mobile: '+91 98470 12345',
  whatsapp: '+91 98470 12345',
  whatsappLink: 'https://wa.me/919847012345',
  email: 'info@fitmates.in',
  address: 'Infopark Expressway, Kakkanad, Ernakulam, Kerala 682030',
  workingHours: 'Mon - Sat: 8:00 AM - 7:00 PM',
  website: 'https://www.fitmates.in'
};

