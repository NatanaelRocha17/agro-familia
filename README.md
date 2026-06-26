
# 🌱 AgroFamília

Plataforma digital desenvolvida para apoiar a divulgação e a comercialização de produtos da agricultura familiar, conectando agricultores e consumidores por meio de uma vitrine digital acessível via web e dispositivos móveis.

O sistema foi desenvolvido como uma **Progressive Web App (PWA)**, permitindo instalação em smartphones e proporcionando uma experiência semelhante à de aplicativos nativos.

## 🎯 Objetivo

Facilitar a divulgação de produtos da agricultura familiar e aproximar produtores e consumidores por meio de recursos digitais como:

- Vitrine digital personalizada por agricultor;
- Busca de produtos por geolocalização;
- Informações de entrega e formas de pagamento;
- Compartilhamento da vitrine do agricultor;
- Negociação direta via WhatsApp.

---

## 🚀 Tecnologias Utilizadas

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- PWA (vite-plugin-pwa)

### Backend

- Node.js
- Express
- TypeScript
- MySQL
- JWT Authentication

### Serviços Externos

- ViaCEP
- OpenCage Geocoding API
- Cloudinary

---

## 📌 Principais Funcionalidades

### Consumidor

- Visualização da vitrine de produtos
- Busca de produtos próximos por geolocalização ou CEP
- Consulta da distância até o agricultor
- Visualização de formas de pagamento
- Visualização das opções de entrega
- Adição de produtos à cesta
- Negociação automática redirecionando para o  WhatsApp

### Agricultor

- Cadastro e autenticação
- Gerenciamento da vitrine digital
- Cadastro de produtos
- Upload de imagens
- Gerenciamento de métodos de pagamento
- Gerenciamento de opções de entrega
- Compartilhamento da vitrine personalizada

---

## 📸 Demonstração

Vídeo de Apresentação da plataforma: https://youtu.be/W9M6ptkZTQQ

## 🏗️ Arquitetura

O projeto está organizado em duas aplicações independentes:

```text
AgroFamilia/
├── frontend/
└── backend/
````

### Frontend

Responsável pela interface do usuário e comunicação com a API.

### Backend

Responsável pelas regras de negócio, autenticação, persistência de dados e integração com serviços externos.

---

## ⚙️ Instalação

### Clone o repositório

```bash
git clone https://github.com/NatanaelRocha17/agro-familia.git
```

### Backend

```bash
cd backend

npm install

npm run dev
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

## 📱 Progressive Web App

A AgroFamília foi desenvolvida como uma PWA, permitindo:

* Instalação no celular;
* Execução em tela cheia;
* Melhor experiência em dispositivos móveis;
* Cache de recursos para carregamento mais rápido.

---

## 🧪 Testes

O projeto possui testes automatizados para validação de funcionalidades do frontend e backend.

Tecnologias utilizadas:

* Vitest
* React Testing Library
* Jest
* Supertest

---

## 📖 Artigo Científico

Este projeto foi desenvolvido para o Trabalho de Conclusão de Curso (TCC) do curso de Sistemas de Informação do IFBA - Campus Vitória da Conquista.

**Título:**

> Desenvolvimento de uma Plataforma Digital para Apoiar a Comercialização de Produtos da Agricultura Familiar


## 👨‍💻 Autor

**Natanael Moreira Rocha**



