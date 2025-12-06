import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/sequelize';
import Vendor from './Vendor';
import RFP from './RFP';

class Proposal extends Model {
  public id!: number;
  public rfp_id!: number;
  public vendor_id!: number;
  public email_subject!: string | null;
  public email_body!: string | null;
  public raw_response!: string | null;
  public parsed_data!: object | null;
  public total_price!: number | null;
  public delivery_days!: number | null;
  public payment_terms!: string | null;
  public warranty_period!: string | null;
  public completeness_score!: number | null;
  public ai_summary!: string | null;
  public ai_recommendation!: string | null;
  public status!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Proposal.init(
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
    email_subject: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    email_body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    raw_response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parsed_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    total_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    delivery_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    payment_terms: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    warranty_period: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    completeness_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    ai_summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ai_recommendation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'received',
    },
  },
  {
    sequelize,
    modelName: 'Proposal',
    tableName: 'proposals',
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
    ],
  }
);

export default Proposal;
