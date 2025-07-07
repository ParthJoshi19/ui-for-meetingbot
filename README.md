# UI for MeetingBot

A React + TypeScript + Vite application for managing API keys with Web3Auth integration and Supabase storage.

## Features

- Web3Auth integration for wallet-based authentication
- NFT selection and API key generation
- Supabase integration for storing API key data
- Modern UI with Tailwind CSS

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

This application uses Supabase to store API key data. You need to:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create a table called `api_keys` with the following schema:

```sql
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  collection_id TEXT NOT NULL,
  nft_id TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. Get your Supabase URL and anon key from your project settings
4. Create a `.env` file in the root directory with:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run the Application

```bash
npm run dev
```

## API Key Storage

When a user generates an API key, the following data is stored in Supabase:
- `user_address`: The user's Ethereum address
- `collection_id`: The NFT collection ID (currently hardcoded to "0")
- `nft_id`: The selected NFT ID
- `api_key`: The generated API key
- `created_at`: Timestamp of creation (auto-generated)

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
