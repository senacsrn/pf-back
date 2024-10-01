# Documentação da API

## Descrição

Esta API permite o gerenciamento de usuários e postagens, incluindo funcionalidades para registro, login, criação de postagens, likes, e atualização de informações de usuários. A API também permite o upload de mídias (imagens e vídeos) associadas a postagens e a recuperação de informações de usuários.

## Estrutura Base da API

- **Base URL**: `http://localhost:8008`
- **Formato de Resposta**: JSON
- **Formato de Entrada**: JSON
- **Método de Autenticação**: Nenhum método de autenticação está implementado, mas recomenda-se usar um token JWT ou outro método em produção.

## Endpoints

### 1. **Registro de Usuário**

- **Método**: `POST`
- **Endpoint**: `/register`
- **Corpo da Requisição**:
    ```json
    {
        "name": "string",
        "email": "string",
        "password": "string",
        "is_ong": "boolean",
        "phone": "string"
    }
    ```
- **Resposta de Sucesso** (201):
    ```json
    {
        "name": "string",
        "email": "string",
        "password": "string",
        "is_ong": "boolean",
        "phone": "string",
        "id": "integer"
    }
    ```
- **Respostas de Erro**:
    - 409: Conflito ao tentar registrar um usuário.

---

### 2. **Login de Usuário**

- **Método**: `POST`
- **Endpoint**: `/login`
- **Corpo da Requisição**:
    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```
- **Resposta de Sucesso** (200):
    ```json
    {
        "id": "integer",
        "name": "string",
        "email": "string",
        "is_ong": "boolean",
        "phone": "string"
    }
    ```
- **Respostas de Erro**:
    - 401: Credenciais inválidas.
    - 500: Erro interno do servidor.

---

### 3. **Criar Postagem**

- **Método**: `POST`
- **Endpoint**: `/posts`
- **Corpo da Requisição**: (FormData)
    - **Campos**:
        - `midia`: Arquivo (imagem ou vídeo)
        - `description`: Descrição da postagem
        - `user_id`: ID do usuário
        - `user_is_ong`: Indica se o usuário é uma ONG
- **Resposta de Sucesso** (201):
    - Mensagem: "Post criado com sucesso"
- **Respostas de Erro**:
    - 500: Erro interno do servidor.

---

### 4. **Curtir Postagem**

- **Método**: `POST`
- **Endpoint**: `/like`
- **Corpo da Requisição**:
    ```json
    {
        "user_id": "integer",
        "post_id": "integer"
    }
    ```
- **Resposta de Sucesso** (200):
    - Mensagem: "Curtir adicionado com sucesso"
- **Respostas de Erro**:
    - 500: Erro interno do servidor.

---

### 5. **Obter Perfil de Usuário e Postagem**

- **Método**: `GET`
- **Endpoint**: `/profile/:id`
- **Parâmetros**:
    - `id`: ID da postagem
- **Resposta de Sucesso** (200):
    ```json
    {
        "post": {
            "id": "integer",
            "description": "string",
            "midia": "buffer",
            "created_at": "string",
            "user_id": "integer",
            "user_is_ong": "boolean"
        },
        "user": {
            "email": "string",
            "name": "string",
            "is_ong": "boolean"
        }
    }
    ```
- **Respostas de Erro**:
    - 404: Postagem não encontrada.
    - 500: Erro interno do servidor.

---

### 6. **Obter Todas as Postagens**

- **Método**: `GET`
- **Endpoint**: `/posts`
- **Resposta de Sucesso** (200):
    ```json
    [
        {
            "id": "integer",
            "description": "string",
            "midia": "buffer",
            "created_at": "string",
            "user_id": "integer",
            "user_is_ong": "boolean"
        },
    ]
    ```
- **Respostas de Erro**:
    - 404: Nenhuma postagem encontrada.
    - 500: Erro interno do servidor.

---

### 7. **Buscar Usuários**

- **Método**: `GET`
- **Endpoint**: `/user/`
- **Parâmetros**: `search`: string
- **Resposta de Sucesso** (200):
    ```json
    [
        {
            "id": "integer",
            "name": "string",
            "email": "string",
            "is_ong": "boolean",
            "phone": "string"
        },
    ]
    ```
- **Respostas de Erro**:
    - 404: Nenhum usuário encontrado.
    - 500: Erro interno do servidor.

---

### 8. **Atualizar Nome do Usuário**

- **Método**: `PUT`
- **Endpoint**: `/user/:id`
- **Parâmetros**:
    - `id`: ID do usuário
- **Corpo da Requisição**:
    ```json
    {
        "name": "string"
    }
    ```
- **Resposta de Sucesso** (200):
    - Mensagem: "Nome do usuário atualizado com sucesso"
- **Respostas de Erro**:
    - 404: Usuário não encontrado.
    - 500: Erro interno do servidor.

---

### 9. **Atualizar Imagem do Usuário**

- **Método**: `PUT`
- **Endpoint**: `/image/:id`
- **Parâmetros**:
    - `id`: ID do usuário
- **Corpo da Requisição**: (FormData)
    - `image`: Arquivo (imagem)
- **Resposta de Sucesso** (200):
    - Mensagem: "Imagem atualizada com sucesso"
- **Respostas de Erro**:
    - 404: Não foi possível atualizar a imagem.
    - 500: Erro interno do servidor.

---

### 10. **Atualizar Telefone do Usuário**

- **Método**: `PUT`
- **Endpoint**: `/phone/:id`
- **Parâmetros**:
    - `id`: ID do usuário
- **Corpo da Requisição**:
    ```json
    {
        "phone": "string"
    }
    ```
- **Resposta de Sucesso** (200):
    - Mensagem: "Telefone atualizado com sucesso"
- **Respostas de Erro**:
    - 404: Não foi possível atualizar o telefone.
    - 500: Erro interno do servidor.

---

### 11. **Obter Mídia da Postagem**

- **Método**: `GET`
- **Endpoint**: `/midia-post/:id`
- **Parâmetros**:
    - `id`: ID da postagem
- **Resposta de Sucesso** (200):
    - Retorna a mídia da postagem.
- **Respostas de Erro**:
    - 404: Mídia não encontrada.
    - 400: Tipo de mídia desconhecido.
    - 500: Erro ao buscar a imagem.

---

### 12. **Obter Imagem do Usuário**

- **Método**: `GET`
- **Endpoint**: `/user-img/:id`
- **Parâmetros**:
    - `id`: ID do usuário
- **Resposta de Sucesso** (200):
    - Retorna a imagem do usuário.
- **Respostas de Erro**:
    - 404: Mídia não encontrada.
    - 500: Erro ao buscar a imagem.

---

## Notas Adicionais

- As imagens e vídeos devem ser enviados em formato de arquivo através do `FormData` nas requisições onde se espera um arquivo.
- Todos os endpoints que envolvem banco de dados são assíncronos e utilizam `async/await`.
- O armazenamento de senhas e outras informações sensíveis não deve ser feito em texto simples em produção. Considere a implementação de hashing e encriptação.

Esta documentação deve servir como um guia abrangente para a utilização da API por desenvolvedores front-end. Se houverem mais funcionalidades ou detalhes, sinta-se à vontade para adicionar!
