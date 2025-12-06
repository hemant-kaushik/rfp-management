import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/sequelize';

class Vendor extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public contact_person!: string | null;
  public phone!: string | null;
  public address!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Vendor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    contact_person: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Vendor',
    tableName: 'vendors',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Vendor;
