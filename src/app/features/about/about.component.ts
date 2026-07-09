import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  template: `
    <div class="about-page">
      <div class="about-container">

        <div class="about-hero">
          <h1>About <span class="accent">Gadgets Mart</span></h1>
        </div>

        <div class="about-card">
          <p class="about-body">
            Gadgets Mart is a fully functional e-commerce application designed to showcase a modern online shopping experience. Positioned as a "one-stop shop for the latest tech gadgets at the best prices," it provides a comprehensive platform where users can browse, search, and simulate purchasing high-end electronics. Visitors can explore dedicated product categories—including <strong>Tablets, Laptops, Mice, Headphones, and Speakers</strong>—or browse featured items like the latest M3-chip laptops. Additionally, the application demonstrates standard e-commerce capabilities such as user account management (profiles, orders, and carts), responsive search functionality, and interactive customer support workflows.
          </p>
        </div>

        <div class="section-title">
          <span class="material-icons">devices</span>
          The Application is Available in 2 Form Factors
        </div>

        <div class="factors-grid">
          <div class="factor-card">
            <span class="material-icons factor-icon">computer</span>
            <h3>Web</h3>
            <p>For computers</p>
            <p class="factor-detail">(Windows and macOS)</p>
          </div>
          <div class="factor-card">
            <span class="material-icons factor-icon">phone_iphone</span>
            <h3>Mobile Web</h3>
            <p>Opening a browser on a</p>
            <p class="factor-detail">mobile device</p>
          </div>
        </div>

        <div class="note-card">
          <span class="material-icons note-icon">info</span>
          <div>
            <strong>Important Note:</strong> Gadgets Mart is not an actual shopping site.
            It is purely used for demonstration purposes. For any inquiry, please contact
            <a href="mailto:admin@gadgets.com" class="note-link">
              admin@gadgets.com
            </a>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .about-page {
      min-height: calc(100vh - 76px);
      background: var(--gm-bg);
      padding: 48px 24px 72px;
    }
    .about-container {
      max-width: 760px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    /* Hero */
    .about-hero { text-align: center; padding-bottom: 8px; }
    .about-hero h1 {
      font-size: 2.2rem; font-weight: 800;
      color: var(--gm-text); margin: 0 0 6px;
      letter-spacing: -0.5px;
    }
    .accent { color: #00bcd4; }
    .hero-sub {
      font-size: 0.95rem; color: var(--gm-text-muted);
      margin: 0; letter-spacing: 0.5px;
    }

    /* Main card */
    .about-card {
      background: var(--gm-bg-secondary);
      border: 1px solid var(--gm-border-soft);
      border-radius: 14px;
      padding: 28px 32px;
    }
    .about-body {
      font-size: 0.95rem; line-height: 1.8;
      color: var(--gm-text-sub); margin: 0;
    }

    /* Section title */
    .section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: var(--gm-text-muted);
    }
    .section-title .material-icons { font-size: 18px; color: #00bcd4; }

    /* Factor cards */
    .factors-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .factor-card {
      background: var(--gm-bg-secondary);
      border: 1px solid var(--gm-border-soft);
      border-radius: 14px;
      padding: 28px 20px 24px;
      text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .factor-card:hover {
      border-color: rgba(0,188,212,0.4);
      box-shadow: 0 4px 20px rgba(0,188,212,0.08);
    }
    .factor-icon { font-size: 32px !important; color: #00bcd4; margin-bottom: 6px; }
    .factor-card h3 {
      font-size: 0.95rem; font-weight: 700;
      color: var(--gm-text); margin: 0;
    }
    .factor-card p {
      font-size: 0.82rem; color: var(--gm-text-sub);
      margin: 0; line-height: 1.4;
    }
    .factor-detail { color: var(--gm-text-muted); font-size: 0.78rem !important; }

    /* Note */
    .note-card {
      display: flex; align-items: flex-start; gap: 12px;
      background: rgba(0,188,212,0.05);
      border: 1px solid rgba(0,188,212,0.2);
      border-radius: 12px;
      padding: 18px 22px;
      font-size: 0.86rem; color: var(--gm-text-sub); line-height: 1.65;
    }
    .note-icon { font-size: 20px !important; color: #00bcd4; flex-shrink: 0; margin-top: 1px; }
    .note-link {
      color: #00bcd4; text-decoration: none; word-break: break-all;
    }
    .note-link:hover { text-decoration: underline; }

    @media (max-width: 600px) {
      .factors-grid { grid-template-columns: 1fr; }
      .about-card { padding: 20px; }
      .about-hero h1 { font-size: 1.7rem; }
    }
  `]
})
export class AboutComponent {}
