# 🐢 SOLUÇÃO: Rota Raiz (index.tsx) "Unmatched Route" no Web Export

Projeto: **Saúde do Gueto v3**
Expo SDK: **52** (`expo-router ~4.0.22`)
Plataforma alvo: **Web (GitHub Pages)**

---

## 🔍 Diagnóstico do Problema

Ao executar `npx expo export --platform web` e abrir o `dist/index.html` (ou fazer deploy no GitHub Pages), a tela fica branca ou mostra **"Unmatched Route"**.

### Causa Raiz

O arquivo `app/index.tsx` faz **redirect automático via `router.replace`** dentro de um `useEffect`:

```tsx
useEffect(() => {
  if (!pronto) return;
  if (!temSenha) {
    router.replace('/(tabs)/dashboard');
  } else {
    router.replace('/(tabs)/login');
  }
}, [pronto, temSenha]);
```

**Problemas com isso no web export:**

1. **O renderizador estático (SSG)** executa o componente uma vez em Node.js. Nesse ambiente, `router.replace` não funciona — o router não está totalmente hidratado.
2. **No navegador**, o JavaScript carrega e tenta navegar antes do roteador terminar de registrar todas as rotas.
3. **GitHub Pages** serve o `index.html` na raiz, mas o Expo Router no web export espera encontrar um arquivo HTML estático para `/`. Se o redirect acontece antes do roteador resolver, cai em "Unmatched Route".
4. **`extra.router.origin: false`** no `app.json` desabilita a detecção automática de origem, o que pode atrapalhar a hidratação do router em produção.

---

## ✅ Solução 1 (Recomendada): Usar `Redirect` do expo-router

A melhor prática do Expo Router para redirects é usar o componente `<Redirect />` em vez de `router.replace()` no `useEffect`. O `Redirect` é um componente que o roteador entende nativamente, inclusive durante a renderização estática.

### O que fazer:

Substitua o conteúdo de `app/index.tsx` por:

```tsx
import { Redirect } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';

export default function Index() {
  const { temSenha } = useAuth();

  if (!temSenha) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/(tabs)/login" />;
}
```

**Por que isso resolve:**
- `<Redirect>` é processado pelo próprio Expo Router, que entende o fluxo de navegação mesmo durante a hidratação
- Não depende de `useEffect` + timer — o redirect acontece de forma declarativa
- Funciona tanto em SSG quanto no cliente
- O componente `Index` pode ficar "vazio" (sem retornar UI visível) porque o redirect é imediato

---

## ✅ Solução 2: Layout vazio + Slot como fallback

Se por algum motivo você quiser manter a estrutura atual, uma alternativa é transformar `app/index.tsx` em um layout que usa `Slot` e colocar o redirect em um componente filho.

### app/index.tsx:

```tsx
import { Slot } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { Redirect } from 'expo-router';

export default function Index() {
  const { temSenha } = useAuth();

  if (!temSenha) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/(tabs)/login" />;
}
```

---

## ✅ Solução 3: Manter lógica com `router.replace` mas adicionar verificação de readiness

Se você **prefere** manter a lógica de `router.replace` (ex.: precisa executar algo antes do redirect), adicione uma verificação se o router está pronto:

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { router, useRootNavigationState } from 'expo-router';

export default function Index() {
  const { temSenha } = useAuth();
  const navigationState = useRootNavigationState();
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    // Aguarda o navigation state estar populado (router hidratado)
    if (!navigationState?.key) return;
    setPronto(true);
  }, [navigationState?.key]);

  useEffect(() => {
    if (!pronto) return;
    if (!temSenha) {
      router.replace('/(tabs)/dashboard');
    } else {
      router.replace('/(tabs)/login');
    }
  }, [pronto, temSenha]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF8C00" />
      <Text style={styles.text}>Saúde do Gueto</Text>
    </View>
  );
}
```

**Mudança chave:** Em vez de `setTimeout(300)`, espera `useRootNavigationState().key` ficar definido — isso garante que o router já registrou as rotas antes de tentar navegar.

---

## ⚙️ Configuração Obrigatória: Static Output

Independente da solução escolhida, você **precisa** ativar o static rendering no `app.json`:

```json
{
  "expo": {
    // ... resto das configs
    "web": {
      "output": "static"
    },
    "extra": {
      "router": {
        "origin": false
      }
    }
  }
}
```

### ⚠️ Atenção sobre `"origin": false`

O `"origin": false` no `extra.router` está **correto** para GitHub Pages. Ele diz ao Expo Router para não tentar detectar a origem automaticamente. Isso é necessário quando o app é servido de um subdiretório (ex.: `https://seuuser.github.io/saude-do-gueto/`).

**Mas:** com `"output": "static"` habilitado, o comportamento pode ser diferente. O ideal é **testar com e sem** `"origin": false` para ver qual funciona.

---

## 🚀 Deploy no GitHub Pages — Checklist Completo

### 1. Configurar `app.json`

```json
{
  "expo": {
    "web": {
      "output": "static"
    }
  }
}
```

### 2. Adicionar script de deploy no `package.json`

```json
{
  "scripts": {
    "deploy:web": "npx expo export --platform web && npx gh-pages -d dist"
  }
}
```

### 3. Corrigir caminhos para GitHub Pages

O GitHub Pages serve seu site em `https://<user>.github.io/<repo>/`. O Expo Router precisa saber disso. Crie (ou modifique) o `app.json` para incluir:

```json
{
  "expo": {
    "extra": {
      "router": {
        "origin": "https://<seu-user>.github.io"
      }
    }
  }
}
```

Ou, se os assets não carregarem, você pode precisar de um script pós-build que ajusta os paths relativos no `dist/`.

### 4. Adicionar arquivo `404.html` no `public/`

GitHub Pages não tem suporte a SPA fallback nativo. Crie `public/404.html` que redireciona para `index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecionando...</title>
  <script>
    sessionStorage.redirect = location.pathname;
    location.href = '/saude-do-gueto/';
  </script>
</head>
<body></body>
</html>
```

### 5. Script pós-build para corrigir assets (se necessário)

Crie `scripts/fix-paths.js`:

```js
const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, '..', 'dist');

function fixAssets(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fixAssets(full);
    } else if (entry.name.endsWith('.html')) {
      let content = fs.readFileSync(full, 'utf8');
      // Ajusta paths absolutos para relativos ao repo
      content = content.replace(/src="\//g, 'src="./');
      content = content.replace(/href="\//g, 'href="./');
      fs.writeFileSync(full, content);
    }
  }
}
fixAssets(dist);
```

---

## 🧪 Teste Local

Antes de fazer deploy, sempre teste localmente:

```bash
# Exporta o web build
npx expo export --platform web

# Serve localmente (instale com: npm install -g serve)
npx serve dist

# OU use http-server
npx http-server dist
```

Abra no navegador e veja se o "Unmatched Route" desapareceu.

---

## 📚 Referências

- [Expo Router - Static Rendering](https://docs.expo.dev/router/web/static-rendering/)
- [Expo Router - Navigation Layouts](https://docs.expo.dev/router/basics/navigation-layouts/)
- [Expo Router - Redirect Component](https://docs.expo.dev/versions/latest/sdk/router/#redirect)
- [GitHub Pages + Expo](https://docs.expo.dev/deploy/github-pages/)
- [Expo Router web output config](https://docs.expo.dev/versions/latest/config/app/#web)

---

## 🏆 Resumo

| Problema | Causa | Solução |
|---|---|---|
| "Unmatched Route" na raiz | `router.replace()` em `useEffect` com timer | Usar `<Redirect />` OU `useRootNavigationState` |
| Static rendering não funciona | `web.output` não configurado | Adicionar `"web": { "output": "static" }` |
| Assets não carregam no GitHub Pages | Paths absolutos vs relativos | Script pós-build OU configurar `origin` |
| Rota não encontrada após redirect | Router não hidratado | Esperar `navigationState.key` ou usar `<Redirect />` |
