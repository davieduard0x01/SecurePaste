# SecurePaste 🔒

> Uma aplicação web segura para compartilhamento de texto, com criptografia ponta-a-ponta (end-to-end) realizada diretamente no navegador do cliente. O servidor apenas armazena um bloco de dados cifrado, sem nunca ter acesso ao conteúdo original ou à chave de decriptografia.

**🚀 [Acesse a versão ao vivo aqui!](https://secure-paste.vercel.app/)**


![image](https://github.com/user-attachments/assets/9a7e35ed-970c-4d90-8a87-ff3f4add0d31)


---

## 💡 Sobre o Projeto

O SecurePaste foi desenvolvido para explorar e demonstrar a implementação de criptografia do lado do cliente usando a Web Crypto API nativa dos navegadores. O objetivo era criar uma solução de "pastebin" onde a privacidade do usuário é a prioridade máxima, garantindo que nem mesmo o administrador do serviço possa ler o conteúdo armazenado.

## ✨ Funcionalidades Principais

* **Criptografia End-to-End:** O texto é criptografado e descriptografado inteiramente no navegador do usuário.
* **Segurança por Design:** A chave de decriptografia é parte do fragmento da URL (`#`), o que impede que ela seja enviada ao servidor.
* **Backend Simples e Seguro:** Utiliza o Firebase Firestore apenas para armazenar o texto cifrado, sem lógica complexa no lado do servidor.
* **Interface Limpa e Direta:** Foco na usabilidade para criar e compartilhar notas seguras rapidamente.

## 🛠️ Tecnologias Utilizadas

* **Front-End:** React, Vite
* **Criptografia:** Web Crypto API (AES-GCM)
* **Backend como Serviço:** Google Firebase (Firestore)
* **Hospedagem:** Vercel

## ⚙️ Como Executar Localmente

```bash
# Clone o repositório
$ git clone [https://github.com/davieduard0x01/SecurePaste.git](https://github.com/davieduard0x01/SecurePaste.git)

# Instale as dependências
$ npm install

# Crie um projeto no Firebase e configure suas chaves no arquivo src/App.jsx

# Inicie o servidor
$ npm run dev
