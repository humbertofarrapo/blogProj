const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const jwt = require("jsonwebtoken");

// Conexão com o MongoDB
mongoose.connect("mongodb+srv://hfarrapo:HFyxAKBCDfKo47EQ@cluster0.u0dmi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conectado ao MongoDB");
  })
  .catch((err) => {
    console.log("Erro ao conectar ao MongoDB");
  });

const User = require("./models/User");
const Post = require("./models/Post");

// Endpoint para registrar um usuário no backend
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verifica se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email já registrado" });
    }

    // Cria um novo usuário
    const newUser = new User({ name, email, password });

    // Gera e armazena o token de verificação
    newUser.verificationToken = crypto.randomBytes(20).toString("hex");

    // Salva o usuário no banco de dados
    await newUser.save();

    // Envia o email de verificação
    sendVerificationEmail(newUser.email, newUser.verificationToken);

    res.status(200).json({ message: "Registro bem-sucedido" });
  } catch (error) {
    console.log("Erro ao registrar usuário", error);
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
});

// Função para enviar o email de verificação
const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "humberto.farrapo@estudante.ifb.edu.br@gmail.com",
      pass: "",
    },
  });

  // Compõe a mensagem do email
  const mailOptions = {
    from: "blog.com",
    to: email,
    subject: "Verificação de Email",
    text: `Por favor, clique no link a seguir para verificar seu email: https://37c993c6-7d90-4eb5-bf6d-42564beec53b-00-l4ltwecn8s44.kirk.replit.dev/verify/${verificationToken}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Erro ao enviar email", error);
  }
};

// Endpoint para verificar o email
app.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;

    // Encontra o usuário pelo token de verificação
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: "Token inválido" });
    }

    // Marca o usuário como verificado e remove o token
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verificado com sucesso" });
  } catch (error) {
    console.log("Erro ao verificar token", error);
    res.status(500).json({ message: "Falha na verificação do email" });
  }
});

// Função para gerar uma chave secreta
const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  return secretKey;
};

const secretKey = generateSecretKey();

// Endpoint para login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Encontra o usuário pelo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email inválido" });
    }

    // Verifica a senha
    if (user.password !== password) {
      return res.status(404).json({ message: "Senha inválida" });
    }

    // Gera um token JWT
    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Falha no login" });
  }
});

// Endpoint para acessar todos os usuários, exceto o usuário logado
app.get("/user/:userId", (req, res) => {
  try {
    const loggedInUserId = req.params.userId;

    User.find({ _id: { $ne: loggedInUserId } })
      .then((users) => {
        res.status(200).json(users);
      })
      .catch((error) => {
        console.log("Erro: ", error);
        res.status(500).json("erro");
      });
  } catch (error) {
    res.status(500).json({ message: "Erro ao obter os usuários" });
  }
});

// Endpoint para seguir um usuário específico
app.post("/follow", async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { followers: currentUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erro ao seguir o usuário" });
  }
});

// Endpoint para deixar de seguir um usuário
app.post("/users/unfollow", async (req, res) => {
  const { loggedInUserId, targetUserId } = req.body;

  try {
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: loggedInUserId },
    });

    res.status(200).json({ message: "Deixou de seguir com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deixar de seguir o usuário" });
  }
});

// Endpoint para criar um novo post
app.post("/create-post", async (req, res) => {
  try {
    const { content, userId } = req.body;

    const newPostData = {
      user: userId,
    };

    if (content) {
      newPostData.content = content;
    }

    const newPost = new Post(newPostData);

    await newPost.save();

    res.status(200).json({ message: "Post salvo com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Falha ao criar o post" });
  }
});

// Endpoint para curtir um post específico
app.put("/posts/:postId/:userId/like", async (req, res) => {
  const postId = req.params.postId;
  const userId = req.params.userId;

  try {
    const post = await Post.findById(postId).populate("user", "name");

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post não encontrado" });
    }
    updatedPost.user = post.user;

    res.json(updatedPost);
  } catch (error) {
    console.error("Erro ao curtir o post:", error);
    res.status(500).json({ message: "Ocorreu um erro ao curtir o post" });
  }
});

// Endpoint para deixar de curtir um post
app.put("/posts/:postId/:userId/unlike", async (req, res) => {
  const postId = req.params.postId;
  const userId = req.params.userId;

  try {
    const post = await Post.findById(postId).populate("user", "name");

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );

    updatedPost.user = post.user;

    if (!updatedPost) {
      return res.status(404).json({ message: "Post não encontrado" });
    }

    res.json(updatedPost);
  } catch (error) {
    console.error("Erro ao deixar de curtir o post:", error);
    res.status(500).json({ message: "Ocorreu um erro ao deixar de curtir o post" });
  }
});

// Endpoint para obter todos os posts
app.get("/get-posts", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Ocorreu um erro ao obter os posts" });
  }
});

// Endpoint para obter o perfil de um usuário
app.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Erro ao obter o perfil" });
  }
});

app.get('/', function(req, res) {
  res.send('Respondendo.');
});

// Iniciando o servidor
app.listen(4000, () => {
  console.log("Servidor rodando.");
});