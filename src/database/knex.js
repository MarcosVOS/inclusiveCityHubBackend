import knex from 'knex';
import config from '../../knexfile.js';

const env = process.env.NODE_ENV || 'development';
const db = knex(config[env]);

// small helper to check connection
async function isHealthy() {
	try {
		await db.raw('select 1+1 as result');
		return true;
	} catch (e) {
		return false;
	}
}

function close() {
	return db.destroy();
}

export default db;
export { isHealthy, close };
