import pkg from 'pg';
const { Pool } = pkg;

const connection = new Pool({
    user: "busai",
    password: "nw2UvQaDTolAkdQSjaDzYjv9u6OpeZ2h", 
    database: "patinhas_felizes", 
    host: "dpg-cs2r4stsvqrc73dph73g-a.oregon-postgres.render.com", 
    port: "5432",
    ssl: {
        rejectUnauthorized: false
    }
});

export default connection;
