# Landora Motors — concessionaria-landora

Site de concessionária de carros premium. Versão atual: **somente visual** (HTML, CSS e JS puros, sem build).

- **Código:** GitHub
- **Desenvolvimento:** GitHub Codespaces
- **Hospedagem, autenticação e banco de dados:** Firebase (Hosting, Authentication, Firestore)

## Estrutura

```
concessionaria-landora/
├── public/              # tudo que vai para o ar (Firebase Hosting)
│   ├── index.html
│   ├── css/styles.css
│   └── js/main.js
├── .devcontainer/       # configuração do Codespaces (já instala o firebase-tools)
├── firebase.json        # configuração do Hosting
└── README.md
```

## 1. Rodar no Codespaces

1. No GitHub, abra o repositório e clique em **Code → Codespaces → Create codespace on main**.
2. Aguarde o ambiente abrir (o `firebase-tools` é instalado automaticamente).
3. Para ver o site, use um destes caminhos:
   - Botão **Go Live** (extensão Live Server) com `public/index.html` aberto; ou
   - No terminal: `npx serve public` e abra a porta que o Codespaces avisar.

## 2. Criar o projeto no Firebase

1. Acesse https://console.firebase.google.com e clique em **Adicionar projeto**. Nome sugerido: `landora-motors`.
2. Dentro do projeto, ative os serviços:
   - **Build → Authentication → Começar** e habilite **E-mail/senha** (e Google, se quiser).
   - **Build → Firestore Database → Criar banco de dados** (modo produção; região `southamerica-east1`).
   - **Build → Hosting → Começar**.
3. Em **Configurações do projeto → Seus apps → Web (`</>`)**, registre um app web e guarde o objeto `firebaseConfig`.

## 3. Conectar o repositório ao Firebase (no terminal do Codespaces)

```bash
firebase login --no-localhost
firebase use --add          # escolha o projeto e dê o apelido "default"
```

Esse último comando cria o arquivo `.firebaserc`. Faça commit dele.

## 4. Publicar o site

```bash
firebase deploy --only hosting
```

O terminal mostra o link `https://SEU-PROJETO.web.app`.

Para ver uma prévia antes de publicar: `firebase hosting:channel:deploy preview`.

## 5. Publicação automática pelo GitHub (opcional)

Dentro do Codespaces, rode:

```bash
firebase init hosting:github
```

O assistente cria os workflows em `.github/workflows` e o segredo no GitHub. Depois disso, cada push na `main` publica o site sozinho.

## Próximas etapas (ainda não implementadas)

- Login e cadastro de clientes (Firebase Authentication)
- Cadastro de carros e leads no Firestore
- Painel administrativo para o estoque
- Fotos reais dos carros (hoje são ilustrações em SVG)
- Telefone, e-mail e endereço reais no rodapé

## Segurança

- O `firebaseConfig` do app web **não é segredo**, mas as regras do Firestore e do Authentication são. Nunca deixe o Firestore em modo de teste em produção.
- Nunca faça commit de chaves de contas de serviço (`serviceAccount*.json`) nem de arquivos `.env`.
