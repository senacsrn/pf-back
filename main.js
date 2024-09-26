import express, { json } from "express";
import cors from "cors";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import connection from "./connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();


app.get("/teste", (req, res)=>{
  const id = uuidv4();
  res.send(id)
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/pictures");
  },
  filename: (req, file, cb) => {
    const date = new Date();
    cb(null, `${date.getTime()}-${file.originalname}`);
  },  
});

const PORT = 8008;
const upload = multer({ storage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, is_ong } = req.body;
    
    await connection.query(`
      INSERT INTO users 
      (name, email, password, is_ong)
      VALUES
      ($1, $2, $3, $4);`, [name, email, password, is_ong]);
    
    const result = await connection.query(`SELECT id FROM users WHERE email = $1;`, [email]);
    const id = result.rows[0].id;

    res.status(201).send({ name, email, password, is_ong, id });
  } catch (error) {
    console.log(error);
    res.sendStatus(409);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await connection.query(`SELECT * FROM users WHERE email = $1 AND password = $2;`, [email, password]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      return res.status(200).send(user);
    } else {
      return res.status(401)
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});



app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});
