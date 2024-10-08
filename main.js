import express, { json } from "express";
import cors from "cors";
import multer from "multer";
import connection from "./connection.js";
import { fileTypeFromBuffer } from "file-type";

const app = express();

const PORT = 8008;
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "image/svg+xml",
      "image/tiff",
      "image/heif",

      "video/mp4",
      "video/avi",
      "video/mov",
      "video/mkv",
      "video/webm",
      "video/ogg",
      "video/3gpp",
      "video/3gpp2",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Tipo de arquivo não permitido. Apenas imagens e vídeos são aceitos."
        ),
        false
      );
    }
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

//POSTS

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, is_ong, phone } = req.body;

    await connection.query(
      `
      INSERT INTO users 
      (name, email, password, is_ong, phone)
      VALUES
      ($1, $2, $3, $4, $5);`,
      [name, email, password, is_ong, phone]
    );

    const result = await connection.query(
      `SELECT id FROM users WHERE email = $1;`,
      [email]
    );
    const id = result.rows[0].id;

    res.status(201).send({ name, email, password, is_ong, phone, id });
  } catch (error) {
    console.log(error);
    res.sendStatus(409);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await connection.query(
      `SELECT * FROM users WHERE email = $1 AND password = $2;`,
      [email, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      return res.status(200).send(user);
    } else {
      return res.status(401).send({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

app.get("/users/", async (req, res) => {
  try {
    const result = await connection.query(`SELECT * FROM users;`);

    return res.status(200).send(result.rows);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

app.post("/posts", upload.single("midia"), async (req, res) => {
  try {
    const { description, user_id, user_is_ong } = req.body;
    const midia = req.file ? req.file.buffer : null;

    const newDate = new Date();
    const timestamp = newDate.toISOString();

    if (midia && description) {
      await connection.query(
        `
        INSERT INTO posts 
        (midia, description, created_at, user_id, user_is_ong)
        VALUES
        ($1, $2, $3, $4, $5);`,
        [midia, description, timestamp, user_id, user_is_ong]
      );
    } else if (midia) {
      await connection.query(
        `
        INSERT INTO posts 
        (midia, created_at, user_id, user_is_ong)
        VALUES
        ($1, $2, $3, $4);`,
        [midia, timestamp, user_id, user_is_ong]
      );
    } else if (description) {
      await connection.query(
        `
        INSERT INTO posts 
        (description, created_at, user_id, user_is_ong)
        VALUES
        ($1, $2, $3, $4);`,
        [description, timestamp, user_id, user_is_ong]
      );
    } else {
      return res.status(400).send("Nenhuma mídia ou descrição recebida");
    }

    res.status(201).send("Post criado com sucesso");
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    res.status(500).send("Erro interno do servidor");
  }
});


app.post("/like", async (req, res) => {
  const { user_id, post_id } = req.body;
  try {
    await connection.query(
      `
      INSERT INTO likes 
      (user_id, post_id)
      VALUES
      ($1, $2);`,
      [user_id, post_id]
    );
  } catch (error) {
    console.log(error);
  }
});

//GETS

app.get("/profile/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await connection.query(`select * from users where id = $1;`, [
      id,
    ]);

    const posts = await connection.query(
      `select * from posts where user_id = $1;`,
      [id]
    );

    const likes = await connection.query(
      `select * from likes where user_id = $1;`,
      [id]
    );

    res.send({
      user: user.rows[0],
      posts_count: posts.rows.length,
      posts: posts.rows,
      likes_count: likes.rows.length,
    });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    res.status(500).json({ error: "Erro ao processar a requisição." });
  }

  // const postId = req.params.id;
  // try {
  //   const postData = await connection.query(`select * from posts where id = $1;`, [postId]);
  //   const post = postData.rows[0];
  //   if (!post) {
  //     return res.status(404).json({ error: "Post not found." });
  //   }
  //   const userData = await connection.query(`select email, name, is_ong from users where id = $1;`, [post.user_id]);
  //   const user = userData.rows[0];
  //   res.status(200).json({
  //     post: post,
  //     user: user
  //   });
  // } catch (error) {
  //   console.error("Erro ao processar a requisição:", error);
  //   res.status(500).json({ error: "Erro ao processar a requisição." });
  // }
});

app.get("/posts", async (req, res) => {
  try {
    const postData = await connection.query(`select * from posts;`);
    const post = postData.rows;
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }
    res.status(200).send(post);
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    res.status(500).json({ error: "Erro ao processar a requisição." });
  }
});

app.get("/user/", async (req, res) => {
  try {
    const search = req.query.search;
    console.log(search.split(" "));
    let foundUsers = [];
    let substrings = search.split(" ");

    for (const subString of substrings) {
      const result = await connection.query(
        "SELECT * FROM users WHERE name ILIKE $1",
        [`%${subString}%`]
      );

      if (result.rows.length > 0) {
        foundUsers.push(result.rows);
      }
    }
    if (foundUsers.length > 0) {
      res.status(200).send(foundUsers);
    } else {
      res.status(404).send("Nenhum usuário encontrado");
    }
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).send("Erro interno do servidor");
  }
});

//PUTS

app.put("/user/:id", upload.single("image"), async (req, res) => {
  try {
    const id = req.params.id;
    const { name, phone } = req.body;
    const image = req.file ? req.file.buffer : null;

    let updates = 0;

    if (name) {
      const result = await connection.query(
        `UPDATE users SET name = $1 WHERE id = $2;`,
        [name, id]
      );
      if (result.rowCount > 0) updates++;
    }

    if (phone) {
      const result = await connection.query(
        `UPDATE users SET phone = $1 WHERE id = $2;`,
        [phone, id]
      );
      if (result.rowCount > 0) updates++;
    }

    if (image) {
      const result = await connection.query(
        `UPDATE users SET image = $1 WHERE id = $2;`,
        [image, id]
      );
      if (result.rowCount > 0) updates++;
    }

    if (updates > 0) {
      res.status(200).send("Dados do usuário atualizados com sucesso.");
    } else {
      res
        .status(404)
        .send("Nenhum dado foi atualizado ou usuário não encontrado.");
    }
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).send("Erro interno do servidor");
  }
});

app.get("/midia-post/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await connection.query(
      "SELECT midia FROM posts WHERE id = $1",
      [id]
    );
    const midia = result.rows[0].midia;

    if (!midia) {
      return res.status(404).send("Midia não encontrada");
    }

    const type = await fileTypeFromBuffer(midia);

    if (!type) {
      return res.status(400).send("Tipo de mídia desconhecido");
    }

    res.set("Content-Type", type.mime);
    res.send(midia);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao buscar a imagem");
  }
});

app.get("/user-img/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await connection.query(
      "SELECT image FROM users WHERE id = $1",
      [id]
    );
    const image = result.rows[0].image;

    if (!image) {
      return res.status(404).send("Midia não encontrada");
    }

    res.set("Content-Type", "image/jpeg");
    res.send(image);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao buscar a imagem");
  }
});

app.listen(PORT, () => {
  console.log(`Server rodando em http://localhost:${PORT}`);
});
