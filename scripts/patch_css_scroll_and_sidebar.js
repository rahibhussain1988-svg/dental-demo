const fs = require('fs');

const cssPath = 'css/styles.css';
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Fix html & body scroll rules
css = css.replace(
  /html\s*\{[\s\S]*?scroll-behavior:\s*smooth;[\s\S]*?overflow-x:\s*hidden;\s*\}/,
  `html {
  min-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}`
);

// 2. Fix app-sidebar top & height
css = css.replace(
  /\.app-sidebar\s*\{[\s\S]*?height:\s*calc\(100vh - 64px\);\s*\}/,
  `.app-sidebar {
  width: var(--sidebar-width);
  background-color: #FFFFFF;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 40;
  transition: var(--transition);
  flex-shrink: 0;
  position: sticky;
  top: 60px;
  height: calc(100vh - 60px);
  overflow: hidden;
}`
);

// 3. Fix nav-section-title & sidebar-footer
css = css.replace(
  /\.nav-section-title\s*\{[\s\S]*?padding:\s*12px 12px 4px;\s*\}/,
  `.nav-section-title {
  display: none !important; /* Headings within menu removed */
}`
);

css = css.replace(
  /\.sidebar-footer\s*\{[\s\S]*?background:\s*#FAFAFA;\s*\}/,
  `.sidebar-footer {
  margin-top: auto;
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  padding: 12px 14px;
  border-top: 1px solid var(--border-color);
  background: #FFFFFF;
  z-index: 20;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
}`
);

// 4. Fix workstation-viewport & section scroll
css = css.replace(
  /#workstation-viewport\s*\{[\s\S]*?overflow-y:\s*visible;\s*\}/,
  `#workstation-viewport {
  padding-top: 60px;
  transition: padding-top 0.25s ease;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: visible;
}`
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('✅ Patched css/styles.css successfully!');
