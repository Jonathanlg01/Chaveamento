# Chaveamento de Campeonato

Site simples em Next.js para criar e visualizar chaveamentos de torneios de eliminação simples.

## Executar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Funcionalidade inicial

- Inserção de participantes (até 16 nomes)
- Geração automática do bracket de eliminação simples
- Visualização das fases do torneio
- Seleção de vencedores para avançar no chaveamento

## Estrutura do projeto

- `app/page.tsx` - página principal que monta o construtor de chaveamento
- `components/BracketBuilder.tsx` - componente principal de criação e visualização
- `components/BracketViewer.tsx` - renderer simples de rounds e jogos
- `lib/bracketLogic.ts` - lógica de construção e avanço do bracket

## Próximos passos

- Adicionar salvamento de chaveamentos
- Criar backend/API para persistência
- Incluir autenticação quando necessário
- Melhorar estilo e visualização do bracket
