#!/usr/bin/env node

/**
 * Script de Configuração Híbrida para Projetos Next.js
 * 
 * Este script aplica automaticamente a configuração híbrida
 * que permite desenvolvimento rápido com segurança em produção.
 * 
 * Uso: node setup-hybrid-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando configuração híbrida...\n');

// 1. Configuração do TypeScript
const tsconfig = {
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
};

// 2. Configuração do Next.js
const nextConfig = `import type { NextConfig } from "next";

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

export default nextConfig;`;

// 3. Configuração do ESLint
const eslintConfig = `import { dirname } from "path";
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

export default eslintConfig;`;

// 4. Configuração do VS Code
const vscodeSettings = {
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
};

// 5. Regras do Cursor
const cursorRules = `# Regras de Desenvolvimento Híbrido

## Configuração Híbrida
- Use tipos flexíveis (any quando necessário para desenvolvimento rápido)
- Evite validações TypeScript muito rígidas em desenvolvimento
- Prefira warnings ao invés de errors
- Use type assertions quando necessário
- Foque na funcionalidade primeiro, tipos depois

## Padrões de Código
- Use \`// eslint-disable-next-line\` para ignorar warnings específicos
- Use \`_\` para prefixar variáveis não utilizadas (ex: \`_unusedVar\`)
- Use type assertions para tipos complexos: \`const data = response as unknown as ExpectedType\`
- Prefira funcionalidade sobre perfeição de tipos
- Use \`@ts-ignore\` quando necessário para desenvolvimento rápido

## Comandos Úteis
- \`pnpm dev:fast\` - Desenvolvimento sem lint (mais rápido)
- \`pnpm build:fast\` - Build sem verificação de tipos
- \`pnpm build:check\` - Build sem lint e sem type-check
- \`pnpm type-check\` - Verificação de tipos separada
- \`pnpm lint:fix\` - Fix automático de lint
- \`pnpm build:prod\` - Build para produção (com todas as verificações)

## Estratégia de Desenvolvimento
1. **Funcionalidade primeiro** - código que funciona
2. **Tipos depois** - refinamento de tipos
3. **Lint por último** - limpeza final

## Configuração por Ambiente
- **Desenvolvimento**: Flexível para velocidade
- **Produção**: Rigoroso para segurança
- **Staging**: Semi-rigido para testes

## Soluções Rápidas para Erros Comuns
\`\`\`typescript
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
\`\`\`

## Foco do Projeto
- **Objetivo**: Desenvolvimento rápido e funcional
- **Prioridade**: Funcionalidade > Tipos > Lint
- **Estratégia**: Híbrida (flexível em dev, rigorosa em prod)`;

// Função para escrever arquivos
function writeFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    if (typeof content === 'object') {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    } else {
      fs.writeFileSync(filePath, content);
    }
    
    console.log(`✅ ${filePath} configurado`);
  } catch (error) {
    console.error(`❌ Erro ao configurar ${filePath}:`, error.message);
  }
}

// Função para atualizar package.json
function updatePackageJson() {
  try {
    const packagePath = './package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    packageJson.scripts = {
      ...packageJson.scripts,
      "dev:fast": "next dev --turbopack --no-lint",
      "build:fast": "next build --turbopack --no-lint",
      "build:check": "next build --turbopack --no-lint --no-type-check",
      "build:prod": "NODE_ENV=production next build --turbopack",
      "lint:fix": "next lint --fix",
      "lint:check": "eslint . --ext .ts,.tsx,.js,.jsx",
      "type-check": "tsc --noEmit",
      "type-check:watch": "tsc --noEmit --watch",
      "clean": "rm -rf .next out dist",
      "clean:all": "rm -rf .next out dist node_modules/.cache"
    };
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json atualizado com scripts híbridos');
  } catch (error) {
    console.error('❌ Erro ao atualizar package.json:', error.message);
  }
}

// Aplicar configurações
console.log('📝 Aplicando configurações...\n');

writeFile('./tsconfig.json', tsconfig);
writeFile('./next.config.ts', nextConfig);
writeFile('./eslint.config.mjs', eslintConfig);
writeFile('./.vscode/settings.json', vscodeSettings);
writeFile('./.cursorrules', cursorRules);
updatePackageJson();

console.log('\n🎉 Configuração híbrida aplicada com sucesso!');
console.log('\n📋 Próximos passos:');
console.log('1. Execute: pnpm install');
console.log('2. Teste: pnpm dev:fast');
console.log('3. Teste: pnpm build:fast');
console.log('4. Configure suas variáveis de ambiente');
console.log('\n🚀 Agora você pode desenvolver rapidamente sem bloqueios de tipos!');
