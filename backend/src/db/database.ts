// import { defineAssociations } from '../models/associations';
import sequelize from './sequelize';

export const initializeDatabase = async (): Promise<void> => {
    try {
        // Test connection
        await sequelize.authenticate();
        console.log('Database connection established');

        // Sync models (create tables if they don't exist)
        await sequelize.sync({ alter: false });
        console.log('All database tables synchronized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}
