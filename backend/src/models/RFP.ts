import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/sequelize';

class RFP extends Model {
  public id!: number;
  public title!: string;
  public description!: string | null;
  public budget!: number | null;
  public delivery_days!: number | null;
  public payment_terms!: string | null;
  public warranty_period!: string | null;
  public requirements!: object | null;
  public status!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

RFP.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    budget: {
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
    requirements: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'draft',
    },
  },
  {
    sequelize,
    modelName: 'RFP',
    tableName: 'rfps',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default RFP;
