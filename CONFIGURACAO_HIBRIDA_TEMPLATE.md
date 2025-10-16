# 🚀 **Template de Configuração Híbrida para Projetos Next.js**

## 📋 **Visão Geral**

Este template implementa uma configuração híbrida que permite:
- ⚡ **Desenvolvimento rápido** sem bloqueios de tipos
- 🛡️ **Segurança rigorosa** em produção
- 🔧 **Flexibilidade** para diferentes ambientes
- 📈 **Produtividade máxima** com qualidade garantida

---

## 🎯 **1. CONFIGURAÇÃO DO TYPESCRIPT**

### **Arquivo: `tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": false,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## ⚙️ **2. CONFIGURAÇÃO DO NEXT.JS**

### **Arquivo: `next.config.ts`**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração híbrida: flexível em desenvolvimento, rigorosa em produção
  typescript: {
    // Ignora erros de TypeScript apenas em desenvolvimento
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Ignora erros de ESLint apenas em desenvolvimento
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  // Configuração de rotas tipadas
  typedRoutes: process.env.NODE_ENV === 'production',
  // Configurações para desenvolvimento mais rápido
  compiler: {
    // Remove console.log em produção
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configurações de performance
  poweredByHeader: false,
  compress: true,
  // Configurações de build
  output: 'standalone',
  // Configurações de imagens
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
```

---

## 🔍 **3. CONFIGURAÇÃO DO ESLINT**

### **Arquivo: `eslint.config.mjs`**
```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Configuração híbrida: warnings em desenvolvimento, errors em produção
      "@typescript-eslint/no-explicit-any": process.env.NODE_ENV === 'production' ? "error" : "warn",
      "@typescript-eslint/no-unused-vars": process.env.NODE_ENV === 'production' ? "error" : "warn",
      "@typescript-eslint/no-non-null-assertion": process.env.NODE_ENV === 'production' ? "error" : "warn",
      "@typescript-eslint/ban-ts-comment": process.env.NODE_ENV === 'production' ? "error" : "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/prefer-const": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "prefer-const": "warn",
      "no-unused-vars": "warn",
      "no-console": process.env.NODE_ENV === 'production' ? "error" : "warn",
      "no-debugger": process.env.NODE_ENV === 'production' ? "error" : "warn",
    },
  },
];

export default eslintConfig;
```

---

## 📦 **4. SCRIPTS DO PACKAGE.JSON**

### **Adicionar ao `package.json`:**
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "dev:fast": "next dev --turbopack --no-lint",
    "build": "next build --turbopack",
    "build:fast": "next build --turbopack --no-lint",
    "build:check": "next build --turbopack --no-lint --no-type-check",
    "build:prod": "NODE_ENV=production next build --turbopack",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "lint:check": "eslint . --ext .ts,.tsx,.js,.jsx",
    "type-check": "tsc --noEmit",
    "type-check:watch": "tsc --noEmit --watch",
    "clean": "rm -rf .next out dist",
    "clean:all": "rm -rf .next out dist node_modules/.cache"
  }
}
```

---

## 🌍 **5. VARIÁVEIS DE AMBIENTE**

### **Arquivo: `.env.local` (Desenvolvimento)**
```env
# Configurações para desenvolvimento flexível
NODE_ENV=development
NEXT_PUBLIC_STRICT_MODE=false
NEXT_PUBLIC_TYPE_CHECK=false
NEXT_PUBLIC_DEBUG=true

# Suas variáveis de desenvolvimento aqui
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=your_dev_database_url
```

### **Arquivo: `.env.production` (Produção)**
```env
# Configurações para produção rigorosa
NODE_ENV=production
NEXT_PUBLIC_STRICT_MODE=true
NEXT_PUBLIC_TYPE_CHECK=true
NEXT_PUBLIC_DEBUG=false

# Suas variáveis de produção aqui
NEXT_PUBLIC_API_URL=https://your-domain.com
DATABASE_URL=your_prod_database_url
```

---

## 🎨 **6. CONFIGURAÇÃO DO VS CODE/CURSOR**

### **Arquivo: `.vscode/settings.json`**
```json
{
  "typescript.preferences.strict": false,
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.inlayHints.parameterNames.enabled": "all",
  "typescript.inlayHints.variableTypes.enabled": true,
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

---

## 📝 **7. REGRAS DE DESENVOLVIMENTO**

### **Arquivo: `.cursorrules`**
```
# Regras de Desenvolvimento Híbrido

## Configuração Híbrida
- Use tipos flexíveis (any quando necessário para desenvolvimento rápido)
- Evite validações TypeScript muito rígidas em desenvolvimento
- Prefira warnings ao invés de errors
- Use type assertions quando necessário
- Foque na funcionalidade primeiro, tipos depois

## Padrões de Código
- Use `// eslint-disable-next-line` para ignorar warnings específicos
- Use `_` para prefixar variáveis não utilizadas (ex: `_unusedVar`)
- Use type assertions para tipos complexos: `const data = response as unknown as ExpectedType`
- Prefira funcionalidade sobre perfeição de tipos
- Use `@ts-ignore` quando necessário para desenvolvimento rápido

## Comandos Úteis
- `pnpm dev:fast` - Desenvolvimento sem lint (mais rápido)
- `pnpm build:fast` - Build sem verificação de tipos
- `pnpm build:check` - Build sem lint e sem type-check
- `pnpm type-check` - Verificação de tipos separada
- `pnpm lint:fix` - Fix automático de lint
- `pnpm build:prod` - Build para produção (com todas as verificações)

## Estratégia de Desenvolvimento
1. **Funcionalidade primeiro** - código que funciona
2. **Tipos depois** - refinamento de tipos
3. **Lint por último** - limpeza final

## Configuração por Ambiente
- **Desenvolvimento**: Flexível para velocidade
- **Produção**: Rigoroso para segurança
- **Staging**: Semi-rigido para testes

## Soluções Rápidas para Erros Comuns
```typescript
// Para tipos complexos
const data = response as unknown as ExpectedType;

// Para variáveis não usadas
const _unusedVar = value;

// Para any necessário
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const flexibleData: any = response;

// Para ignorar TypeScript
// @ts-ignore
const problematicCode = someComplexType;
```

## Foco do Projeto
- **Objetivo**: Desenvolvimento rápido e funcional
- **Prioridade**: Funcionalidade > Tipos > Lint
- **Estratégia**: Híbrida (flexível em dev, rigorosa em prod)
```

---

## 🚀 **8. COMANDOS PARA USAR**

### **Desenvolvimento Diário**
```bash
# Desenvolvimento normal (com lint)
pnpm dev

# Desenvolvimento super rápido (sem lint)
pnpm dev:fast

# Build para teste
pnpm build:fast

# Verificação de tipos
pnpm type-check

# Fix de lint
pnpm lint:fix
```

### **Produção**
```bash
# Build rigoroso para produção
pnpm build:prod

# Limpeza de cache
pnpm clean

# Limpeza completa
pnpm clean:all
```

---

## 📊 **9. BENEFÍCIOS DA CONFIGURAÇÃO HÍBRIDA**

| Aspecto | Desenvolvimento | Produção |
|---------|----------------|----------|
| **Velocidade** | ⚡ Rápido | 🐌 Rigoroso |
| **Tipos** | 🔧 Flexível | 🛡️ Strict |
| **Lint** | ⚠️ Warnings | ❌ Errors |
| **Build** | ✅ Sem bloqueios | 🔍 Validação completa |
| **Produtividade** | 📈 Máxima | 🎯 Qualidade |

---

## 🎯 **10. CHECKLIST DE IMPLEMENTAÇÃO**

### **Para Aplicar em Novos Projetos:**

- [ ] **1. Configurar TypeScript** (`tsconfig.json`)
- [ ] **2. Configurar Next.js** (`next.config.ts`)
- [ ] **3. Configurar ESLint** (`eslint.config.mjs`)
- [ ] **4. Adicionar Scripts** (`package.json`)
- [ ] **5. Configurar Ambiente** (`.env.local`, `.env.production`)
- [ ] **6. Configurar Editor** (`.vscode/settings.json`)
- [ ] **7. Criar Regras** (`.cursorrules`)
- [ ] **8. Testar Build** (`pnpm build:fast`)
- [ ] **9. Testar Desenvolvimento** (`pnpm dev:fast`)
- [ ] **10. Testar Produção** (`pnpm build:prod`)

---

## 🏆 **11. RESULTADO ESPERADO**

Após implementar esta configuração:

✅ **Build funcionando** sem erros bloqueantes  
✅ **Desenvolvimento rápido** sem bloqueios de tipos  
✅ **Segurança garantida** em produção  
✅ **Produtividade maximizada** com qualidade  
✅ **Flexibilidade** para diferentes ambientes  
✅ **Manutenibilidade** do código  

---

## 📚 **12. RECURSOS ADICIONAIS**

### **Documentação Oficial:**
- [Next.js Configuration](https://nextjs.org/docs/app/api-reference/config)
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig)
- [ESLint Configuration](https://eslint.org/docs/latest/use/configure/)

### **Ferramentas Recomendadas:**
- **Validação**: Zod, Yup
- **Estado**: Zustand, Redux Toolkit
- **Formulários**: React Hook Form
- **Testes**: Jest, Testing Library

---

## 🎉 **CONCLUSÃO**

Esta configuração híbrida permite:
- 🚀 **Desenvolvimento ágil** sem comprometer qualidade
- 🛡️ **Segurança rigorosa** em produção
- 🔧 **Flexibilidade** para diferentes necessidades
- 📈 **Produtividade máxima** com manutenibilidade

**Use este template como base para todos os seus projetos Next.js!** 🎯
