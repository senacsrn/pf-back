import express, { json } from "express";
import cors from "cors";
import fs from "fs";
import multer from "multer";
import connection from "./connection.js";
import { create } from "domain";


const app = express();


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

app.post("/posts", upload.single("image"), async (req, res) => {
  try {
    const { image, description, user_id, user_is_ong } = req.body;
    await connection.query(`
      INSERT INTO posts 
      (image, description, created_at, user_id, user_is_ong)
      VALUES
      ($1, $2, $3, $4, $5);`, [image, description, create_at, user_id, user_is_ong])
    res.status(201).json({ message: "Post criado com sucesso!", post: dados });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    res.status(500).json({ error: "Erro ao processar a requisição." });
  }
});




app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});
