import { query } from '../../../db.js';

export class ContentService {
  async getServices() {
    try {
      const rows = await query(`SELECT * FROM services ORDER BY sort_order ASC`);
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.warn('[ContentService] DB query failed, using mock services.');
    }

    return [
      { id: 'srv-1', title: 'Precision Laser Alignment', subtitle: 'Perfect Square Fitting', description: 'Laser-guided calibration ensures sub-millimeter door alignment without binding or drag.', icon: 'crosshair', tags: ['0.5mm Tolerance', 'Smooth Swing', 'Zero Friction'] },
      { id: 'srv-2', title: 'Zero Wall Damage Guarantee', subtitle: 'Clean Dry-Anchor Process', description: 'Advanced core-drilling with vacuum capture anchors frames without cracking plaster or tiles.', icon: 'shield-check', tags: ['No Plaster Cracks', 'Dust-Controlled', 'Tile-Safe Anchoring'] },
      { id: 'srv-3', title: 'Acoustic & Weather Seal Fitting', subtitle: 'Triple-Gasket Technology', description: 'Commercial-grade perimeter EPDM seals block drafts, dust, rainwater, and outside noise.', icon: 'volume-x', tags: ['Draft-Proof', 'Water Barrier', '38dB Reduction'] },
      { id: 'srv-4', title: 'Multi-Point Security Lock Rigging', subtitle: 'Grade 1 Deadbolts & Smart Locks', description: 'Heavy-duty mortise locksets, euro-profile cylinders, and anti-drill strike plates.', icon: 'lock', tags: ['Anti-Pry Bolts', 'Hardened Steel', 'Smart Ready'] },
      { id: 'srv-5', title: 'Heavy Frame Anchor Installation', subtitle: 'Reinforced Steel Jambs', description: 'Deep masonry anchors designed for concrete and brick ensure frames withstand forced entry.', icon: 'wrench', tags: ['High-Tensile Bolts', 'Seismic Rated', 'Corrosion Coated'] },
      { id: 'srv-6', title: '2-Year Warranty & Free Tuning', subtitle: 'Doorstep Service Promise', description: 'Every installation is backed by our certified fitting guarantee with annual hinge tuning.', icon: 'badge-check', tags: ['24-Month Cover', 'Doorstep Tuning', 'Certified Technicians'] }
    ];
  }

  async getTestimonials() {
    return [
      { id: 'test-1', clientName: 'Vikas Sharma', clientType: 'company', companyName: 'Metro Infra Ltd, Kakkanad', rating: 5, comment: 'Installed 48 steel doors across our commercial project in SmartCity. Flawless alignment.', avatar: 'VS', date: '2026-03-15' },
      { id: 'test-2', clientName: 'Arun Varma', clientType: 'dealer', companyName: 'Apex Doors Kochi', rating: 5, comment: 'As a dealer, SteelGuard is our preferred fitting partner. Prompt branch coordination.', avatar: 'AV', date: '2026-02-28' },
      { id: 'test-3', clientName: 'John Mathew', clientType: 'customer', companyName: 'Residential Villa, Kaloor', rating: 5, comment: 'Clean work with zero tile damage during frame installation. Highly recommend.', avatar: 'JM', date: '2026-03-02' }
    ];
  }

  async getSiteContent() {
    return {
      companyName: 'SteelGuard Precision Installations',
      tagline: 'Expert Steel Door Fitting Across Kerala',
      supportPhone: '+91 98000 11223',
      supportEmail: 'support@steelguarddoors.com',
      banners: [
        { id: 'ban-1', headline: 'Steel Doors & Frames — Installed Right.', subheadline: 'Expert steel door installation and precision frame mounting across Kerala.', image: '/assets/images/banner1.jpg', ctaText: 'Book Installation', ctaLink: '/book-now' },
        { id: 'ban-2', headline: 'Zero Wall Damage Guarantee', subheadline: 'Laser-guided calibration and clean dry-anchor technology.', image: '/assets/images/banner2.jpg', ctaText: 'Explore Services', ctaLink: '/services' }
      ]
    };
  }
}

export const contentService = new ContentService();
