
import Vendor from './Vendor';
import RFP from './RFP';
import RFPVendor from './RFPVendor';
import Proposal from './Proposal';

// RFP to Vendor (Many-to-Many through RFPVendor)
RFP.belongsToMany(Vendor, {
  through: RFPVendor,
  foreignKey: 'rfp_id',
  otherKey: 'vendor_id',
  as: 'vendors',
});

Vendor.belongsToMany(RFP, {
  through: RFPVendor,
  foreignKey: 'vendor_id',
  otherKey: 'rfp_id',
  as: 'rfps',
});

// RFPVendor belongs to RFP and Vendor
RFPVendor.belongsTo(RFP, {
  foreignKey: 'rfp_id',
  as: 'rfp',
});

RFPVendor.belongsTo(Vendor, {
  foreignKey: 'vendor_id',
  as: 'vendor',
});

RFP.hasMany(RFPVendor, {
  foreignKey: 'rfp_id',
  as: 'rfpVendors',
});

Vendor.hasMany(RFPVendor, {
  foreignKey: 'vendor_id',
  as: 'rfpVendors',
});

// RFP -> Proposal (One-to-Many)
RFP.hasMany(Proposal, {
  foreignKey: 'rfp_id',
  as: 'proposals',
});

Proposal.belongsTo(RFP, {
  foreignKey: 'rfp_id',
  as: 'rfp',
});

// Vendor -> Proposal (One-to-Many)
Vendor.hasMany(Proposal, {
  foreignKey: 'vendor_id',
  as: 'proposals',
});

Proposal.belongsTo(Vendor, {
  foreignKey: 'vendor_id',
  as: 'vendor',
});

export { RFP, Vendor, RFPVendor, Proposal };

