import pkg from 'pg';
const {Pool} = pkg;

const connection = new Pool(
    {
        user: "postgres",
        password: "0350365",
        database: "patinhas_felizes",
        host: "localhost",
        port: "5432"
    }
)

export default connection
