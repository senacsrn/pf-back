import express, { json } from "express";
import cors from "cors";
import multer from "multer";
import connection from "./connection.js";


const app = express();

const PORT = 8008;
const upload = multer({ storage: multer.memoryStorage() });


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

app.post("/posts", upload.single("midia"), async (req, res) => {
  try {
    console.log(req.file);

    const { description, user_id, user_is_ong } = req.body;
    const midia = req.file.buffer;

    console.log(midia)

    const newDate = new Date();
    const timestamp = newDate.toISOString(); 

    await connection.query(`
      INSERT INTO posts 
      (midia, description, created_at, user_id, user_is_ong)
      VALUES
      ($1, $2, $3, $4, $5);`, [midia, description, timestamp, user_id, user_is_ong]);
    
    res.status(201).send("Post criado com sucesso");
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    res.status(500).send("Erro interno do servidor");
  }
});

app.post("/like", async (req, res)=>{
  const {user_id,  post_id} = req.body;
  try {
    await connection.query(`
      INSERT INTO posts 
      (user_id, post_id)
      VALUES
      ($1, $2);`, [user_id, post_id]);
  }
  catch(error){
    console.log(error)
  }
})

app.get("/posts/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const postData = await connection.query(`select * from posts where id = $1;`, [postId]);
    const post = postData.rows[0];
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }
    const userData = await connection.query(`select email, name, is_ong from users where id = $1;`, [post.user_id]);
    const user = userData.rows[0];
    res.status(200).json({
      post: post,
      user: user
    });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    res.status(500).json({ error: "Erro ao processar a requisição." });
  }
});



app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});
