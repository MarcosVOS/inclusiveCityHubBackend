## 1. Ideia estrutura de Pastas Final

```
/
|-- src/
|   |-- controllers/    // Lógica de negócio (req, res)
|   |-- database/
|   |   |-- migrations/ // Arquivos de migração do Knex
|   |   `-- knex.js     // Configuração da conexão do Knex
|   |-- middleware/     // Funções intermediárias (ex: autenticação)
|   |-- models/         // <<-- Lógica de acesso ao banco de dados
|   |-- routes/         // Definição das rotas da API
|   `-- server.js       // Arquivo principal que inicia o servidor
|-- .env                // Variáveis de ambiente
|-- knexfile.js         // Configurações do Knex para CLI
`-- package.json
```

## 2. Ideia de tabelas

```sql
-- Table to store all types of users (common, company, admin)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    -- The user type determines if it needs a corresponding entry in the companies table.
    user_type ENUM('common', 'company', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store specific information for companies.
-- This table has a one-to-one relationship with the users table.
CREATE TABLE companies (
    -- The user_id is both the Primary Key and the Foreign Key.
    -- This enforces that one user can only have one company entry.
    user_id INT PRIMARY KEY,
    cnpj VARCHAR(18) NOT NULL UNIQUE, -- Brazilian company tax ID
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- The FOREIGN KEY constraint links this table to the users table.
    -- ON DELETE CASCADE means if the user is deleted, its company profile is also deleted.
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for event categories
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Table to store events created by companies
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    -- Events are linked directly to the company (via its user_id).
    company_id INT NOT NULL,
    category_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```
