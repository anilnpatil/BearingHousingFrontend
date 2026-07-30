const PptxGenJs = require('pptxgenjs');

// Create presentation
const prs = new PptxGenJs();
prs.defineLayout({ name: 'LAYOUT1', width: 10, height: 7.5 });
prs.layout = 'LAYOUT1';

// Define colors
const colors = {
  primary: '2563EB',
  primaryDark: '1e40af',
  accent: '764ba2',
  text: '#1e293b',
  lightBg: '#f0f4f8',
  darkBg: '#1a202c',
  success: '#4caf50',
  warning: '#ff9800'
};

// Helper function to add title slide
function addTitleSlide(title, subtitle) {
  const slide = prs.addSlide();
  slide.background = { color: colors.primary };
  
  slide.addText(title, {
    x: 0.5, y: 2.5, w: 9, h: 1,
    fontSize: 54, bold: true, color: 'FFFFFF', align: 'center'
  });
  
  slide.addText(subtitle, {
    x: 0.5, y: 3.7, w: 9, h: 0.8,
    fontSize: 28, color: 'FFFFFF', align: 'center'
  });
}

// Helper function to add content slide
function addContentSlide(title, content) {
  const slide = prs.addSlide();
  slide.background = { color: 'FFFFFF' };
  
  // Title
  slide.addText(title, {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    fontSize: 40, bold: true, color: colors.primary
  });
  
  // Separator line
  slide.addShape(prs.ShapeType.rect, {
    x: 0.5, y: 1.1, w: 9, h: 0.05,
    fill: { color: colors.primary }
  });
  
  return slide;
}

// Slide 1: Title
addTitleSlide('NextFirst Filtrex', 'Production Management System - User Guide');

// Slide 2: Application Overview
let slide = addContentSlide('Application Overview', []);
slide.addText('A comprehensive manufacturing data management and analytics platform', {
  x: 0.5, y: 1.4, w: 9, h: 0.4,
  fontSize: 16, color: colors.text
});

const overviewPoints = [
  '📊 Real-time production monitoring and data visualization',
  '📈 Advanced reporting and analytics capabilities',
  '👥 Role-based user management (Admin & User roles)',
  '🔐 Secure authentication and authorization',
  '⚙️ Production equipment and process data tracking'
];

overviewPoints.forEach((point, idx) => {
  slide.addText(point, {
    x: 1, y: 2.0 + (idx * 0.6), w: 8.5, h: 0.5,
    fontSize: 14, color: colors.text
  });
});

// Slide 3: Application Flow
slide = addContentSlide('Application Flow', []);

// Flow diagram
const flows = [
  { label: 'Login/Register', y: 1.5, color: colors.primary },
  { label: 'Dashboard', y: 2.8, color: colors.accent },
  { label: 'Realtime Data', y: 4.1, color: colors.primary }
];

flows.forEach((flow, idx) => {
  slide.addShape(prs.ShapeType.roundRect, {
    x: 3.5, y: flow.y, w: 3, h: 0.6,
    fill: { color: flow.color }
  });
  
  slide.addText(flow.label, {
    x: 3.5, y: flow.y, w: 3, h: 0.6,
    fontSize: 16, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle'
  });
  
  if (idx < flows.length - 1) {
    slide.addShape(prs.ShapeType.triangle, {
      x: 4.85, y: 2.2 + (idx * 1.3), w: 0.3, h: 0.4,
      fill: { color: colors.primary }
    });
  }
});

// Slide 4: Login & Registration
slide = addContentSlide('Login & Registration', []);

slide.addText('User Authentication:', {
  x: 0.5, y: 1.4, w: 9, h: 0.4,
  fontSize: 18, bold: true, color: colors.primary
});

const authPoints = [
  '✦ Login Page: Enter username and password to access the system',
  '✦ Registration Page: Create new user account with role selection',
  '✦ Role Options: USER (standard user) or ADMIN (administrator)',
  '✦ Secure authentication with encrypted credentials',
  '✦ Session management and automatic logout on inactivity'
];

authPoints.forEach((point, idx) => {
  slide.addText(point, {
    x: 1, y: 2.0 + (idx * 0.6), w: 8.5, h: 0.5,
    fontSize: 13, color: colors.text
  });
});

// Slide 5: Dashboard
slide = addContentSlide('Dashboard', []);

slide.addText('Main landing page after login showing key metrics and quick access', {
  x: 0.5, y: 1.4, w: 9, h: 0.4,
  fontSize: 14, color: colors.text
});

const dashboardFeatures = [
  [
    '📊 Production Summary Cards',
    '  • Total production count',
    '  • Daily/weekly trends',
    '  • Equipment status'
  ],
  [
    '⚡ Real-time Metrics',
    '  • Cycle time monitoring',
    '  • Quality measurements',
    '  • System alerts'
  ],
  [
    '🎯 Quick Navigation',
    '  • Access to reports',
    '  • Realtime data view',
    '  • Historical analytics'
  ]
];

let yPos = 2.0;
dashboardFeatures.forEach(feature => {
  feature.forEach((line, idx) => {
    const fontSize = idx === 0 ? 14 : 12;
    const bold = idx === 0 ? true : false;
    slide.addText(line, {
      x: 0.8, y: yPos, w: 8.7, h: 0.35,
      fontSize: fontSize, bold: bold, color: colors.text
    });
    yPos += 0.35;
  });
  yPos += 0.2;
});

// Slide 6: Real-time Data
slide = addContentSlide('Real-Time Data Monitor', []);

slide.addText('Live production equipment data display', {
  x: 0.5, y: 1.4, w: 9, h: 0.4,
  fontSize: 14, color: colors.text
});

// Create data grid visualization
const dataFields = [
  ['Production Count', '1250 units'],
  ['Cycle Time', '45.3 seconds'],
  ['Air Flow Test', 'PASS'],
  ['Assembly Height', '150.2 mm'],
  ['Pressure Level', '42.5 PSI'],
  ['Status', 'OK ✓']
];

const colWidth = 4;
const startX = 1;
const startY = 2.0;

dataFields.forEach((field, idx) => {
  const row = Math.floor(idx / 2);
  const col = idx % 2;
  const x = startX + (col * colWidth);
  const y = startY + (row * 0.9);
  
  // Label
  slide.addText(field[0], {
    x: x, y: y, w: colWidth - 0.3, h: 0.35,
    fontSize: 11, bold: true, color: colors.primary
  });
  
  // Value
  slide.addShape(prs.ShapeType.rect, {
    x: x, y: y + 0.4, w: colWidth - 0.3, h: 0.35,
    fill: { color: colors.lightBg },
    line: { color: colors.primary, width: 1 }
  });
  
  slide.addText(field[1], {
    x: x, y: y + 0.4, w: colWidth - 0.3, h: 0.35,
    fontSize: 12, bold: true, color: colors.text, align: 'center', valign: 'middle'
  });
});

// Slide 7: Reports
slide = addContentSlide('Reports & Analytics', []);

slide.addText('Comprehensive reporting features for data analysis:', {
  x: 0.5, y: 1.4, w: 9, h: 0.4,
  fontSize: 14, color: colors.text
});

const reportTypes = [
  {
    title: '📋 Parameter Reports',
    desc: 'Detailed measurement data for specific production parameters'
  },
  {
    title: '📊 Production Reports',
    desc: 'Summary of production counts, cycle times, and efficiency metrics'
  },
  {
    title: '📈 Graphical Reports',
    desc: 'Visual charts and graphs showing trends and patterns'
  },
  {
    title: '🎯 Quality Reports',
    desc: 'Production quality metrics and pass/fail analysis'
  },
  {
    title: '📉 Trend Analysis',
    desc: 'Historical data trends and predictive analytics'
  }
];

let reportY = 2.0;
reportTypes.forEach((report) => {
  slide.addText(report.title, {
    x: 1, y: reportY, w: 8.5, h: 0.3,
    fontSize: 13, bold: true, color: colors.primary
  });
  
  slide.addText(report.desc, {
    x: 1.2, y: reportY + 0.35, w: 8.3, h: 0.3,
    fontSize: 11, color: colors.text
  });
  
  reportY += 0.85;
});

// Slide 8: Admin Panel
slide = addContentSlide('Admin Panel', []);

slide.addText('Administrative functions (ADMIN role only):', {
  x: 0.5, y: 1.4, w: 9, h: 0.4,
  fontSize: 14, color: colors.text
});

const adminFeatures = [
  {
    title: '👥 User Management',
    features: [
      '  • View all registered users',
      '  • Create new user accounts',
      '  • Assign user roles (USER/ADMIN)',
      '  • Delete user accounts',
      '  • Filter and sort users'
    ]
  },
  {
    title: '🔐 Permissions & Access Control',
    features: [
      '  • Manage role-based access',
      '  • Control feature visibility',
      '  • Audit user activities'
    ]
  }
];

let adminY = 2.0;
adminFeatures.forEach((section) => {
  slide.addText(section.title, {
    x: 1, y: adminY, w: 8.5, h: 0.3,
    fontSize: 14, bold: true, color: colors.primary
  });
  
  adminY += 0.4;
  
  section.features.forEach(feature => {
    slide.addText(feature, {
      x: 1.2, y: adminY, w: 8.3, h: 0.3,
      fontSize: 12, color: colors.text
    });
    adminY += 0.35;
  });
  
  adminY += 0.2;
});

// Slide 9: User Features
slide = addContentSlide('User Workspace', []);

slide.addText('Standard user features and access:', {
  x: 0.5, y: 1.4, w: 9, h: 0.4,
  fontSize: 14, color: colors.text
});

const userFeatures = [
  '📊 View Dashboard: Access to production overview and key metrics',
  '⚡ Real-time Monitoring: Live equipment data and production status',
  '📈 Generate Reports: Create and download various analytical reports',
  '📋 View Historical Data: Access past production records and trends',
  '🔍 Filter & Search: Find specific data within the reporting system',
  '📥 Export Data: Download reports in various formats'
];

let userY = 2.0;
userFeatures.forEach((feature) => {
  slide.addText(feature, {
    x: 1, y: userY, w: 8.5, h: 0.5,
    fontSize: 13, color: colors.text
  });
  userY += 0.65;
});

// Slide 10: UI Highlights
slide = addContentSlide('User Interface Features', []);

slide.addText('Modern and intuitive design elements:', {
  x: 0.5, y: 1.4, w: 9, h: 0.4,
  fontSize: 14, color: colors.text
});

const uiFeatures = [
  [
    '🎨 Professional Design',
    '  • Clean and modern interface',
    '  • Responsive on all devices',
    '  • Industry-standard color scheme'
  ],
  [
    '⚙️ Navigation',
    '  • Sidebar menu for quick access',
    '  • Breadcrumb navigation',
    '  • Quick action buttons'
  ],
  [
    '📱 Mobile-Friendly',
    '  • Touch-optimized buttons',
    '  • Responsive layouts',
    '  • Fast loading times'
  ]
];

let uiY = 2.0;
uiFeatures.forEach(feature => {
  feature.forEach((line, idx) => {
    const fontSize = idx === 0 ? 14 : 12;
    const bold = idx === 0 ? true : false;
    slide.addText(line, {
      x: 0.8, y: uiY, w: 8.7, h: 0.35,
      fontSize: fontSize, bold: bold, color: colors.text
    });
    uiY += 0.35;
  });
  uiY += 0.2;
});

// Slide 11: Data Security
slide = addContentSlide('Security & Data Protection', []);

const securityPoints = [
  '🔒 Encrypted Passwords: All user passwords are securely encrypted',
  '🔐 Authentication: Secure login system with session management',
  '👤 Role-Based Access: Features restricted based on user role',
  '📊 Data Integrity: Consistent database with validation',
  '🛡️ HTTPS: Secure communication between client and server',
  '📝 Audit Logs: Track user activities and changes'
];

let secY = 1.5;
securityPoints.forEach((point) => {
  slide.addText(point, {
    x: 1, y: secY, w: 8.5, h: 0.5,
    fontSize: 13, color: colors.text
  });
  secY += 0.65;
});

// Slide 12: Key Data Metrics
slide = addContentSlide('Key Production Metrics', []);

slide.addText('Data points monitored in the system:', {
  x: 0.5, y: 1.4, w: 9, h: 0.4,
  fontSize: 14, color: colors.text
});

const metrics = [
  {col: 0, title: 'Production Count', desc: 'Total units produced'},
  {col: 0, title: 'Cycle Time', desc: 'Time per production cycle'},
  {col: 1, title: 'Air Flow Test', desc: 'Quality measurement result'},
  {col: 1, title: 'Assembly Height', desc: 'Dimension verification'},
  {col: 2, title: 'Press Time', desc: 'Top & bottom press duration'},
  {col: 2, title: 'Hold Time', desc: 'Pressure hold duration'},
];

metrics.forEach((metric) => {
  const x = 0.8 + (metric.col * 3);
  const y = 2.0 + ((metric.col % 2) * 1.5);
  
  slide.addShape(prs.ShapeType.rect, {
    x: x, y: y, w: 2.8, h: 1.2,
    fill: { color: colors.lightBg },
    line: { color: colors.primary, width: 1 }
  });
  
  slide.addText(metric.title, {
    x: x + 0.1, y: y + 0.2, w: 2.6, h: 0.4,
    fontSize: 12, bold: true, color: colors.primary
  });
  
  slide.addText(metric.desc, {
    x: x + 0.1, y: y + 0.65, w: 2.6, h: 0.4,
    fontSize: 10, color: colors.text, align: 'center'
  });
});

// Slide 13: Getting Started
slide = addContentSlide('Getting Started', []);

slide.addText('Step-by-step guide:', {
  x: 0.5, y: 1.4, w: 9, h: 0.4,
  fontSize: 14, color: colors.text
});

const steps = [
  '1️⃣ Access the Application: Open the web browser and navigate to the application URL',
  '2️⃣ Login or Register: Use existing credentials or create a new account',
  '3️⃣ Review Dashboard: Check production overview and key metrics',
  '4️⃣ Monitor Real-time Data: View live equipment data on the realtimedata page',
  '5️⃣ Generate Reports: Create custom reports for analysis',
  '6️⃣ Download & Export: Save reports for offline access or sharing'
];

let stepY = 2.0;
steps.forEach((step) => {
  slide.addText(step, {
    x: 1, y: stepY, w: 8.5, h: 0.5,
    fontSize: 13, color: colors.text
  });
  stepY += 0.65;
});

// Slide 14: Summary and Support
slide = addContentSlide('Summary', []);

slide.addText('Key Takeaways:', {
  x: 0.5, y: 1.4, w: 9, h: 0.4,
  fontSize: 18, bold: true, color: colors.primary
});

const summary = [
  '✓ Comprehensive production monitoring and analytics platform',
  '✓ Role-based access control for secure data management',
  '✓ Real-time data visualization with advanced reporting',
  '✓ User-friendly interface for easy navigation',
  '✓ Scalable and secure system for manufacturing operations',
  '',
  'For support, contact: admin@filtrex.local'
];

let sumY = 2.0;
summary.forEach((line) => {
  slide.addText(line, {
    x: 1, y: sumY, w: 8.5, h: 0.45,
    fontSize: 13, color: line === '' ? 'FFFFFF' : colors.text,
    bold: line.includes('For support') ? true : false
  });
  sumY += 0.55;
});

// Save presentation
prs.writeFile({ fileName: 'NextFirst_Filtrex_User_Guide.pptx' });
console.log('✅ Presentation created successfully: NextFirst_Filtrex_User_Guide.pptx');
