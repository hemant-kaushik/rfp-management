import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/sequelize';
import Vendor from './Vendor';
import RFP from './RFP';

class RFPVendor extends Model {
  public id!: number;
  public rfp_id!: number;
  public vendor_id!: number;
  public sent_at!: Date | null;
  public status!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

RFPVendor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    rfp_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: RFP,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Vendor,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'RFPVendor',
    tableName: 'rfp_vendors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['rfp_id'],
      },
      {
        fields: ['vendor_id'],
      },
      {
        unique: true,
        fields: ['rfp_id', 'vendor_id'],
      },
    ],
  }
);

export default RFPVendor;
