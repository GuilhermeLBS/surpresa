# Uma cartinha para Duda

Site local em HTML, CSS e JavaScript, sem dependências e sem publicação.

## Visualizar

Abra `index.html` no navegador, use Live Server no VS Code ou execute nesta pasta:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Depois abra http://127.0.0.1:8000. Encerre o servidor com Ctrl+C.

## Sequência atual

1. A tela inicial exibe Duda, envelope e flores fixas nos cantos. O coração começa oculto.
2. Clique no envelope (ou Enter/Espaço): as flores chegam dos quatro lados e formam um coração giratório; o envelope pula, pousa suavemente, abre a aba e deixa o papel sair.
3. O papel se amplia para mostrar toda a mensagem da madrinha, com assinatura “Te amo”. A leitura não tem limite de tempo.
4. O pequeno botão triangular de play abaixo da carta separa o papel/envelope em duas partes, dispersa as flores e revela somente o container de vídeo.
5. Antes do vídeo aparece um painel cinza com “Uma mensagem somente para você. Com muito amor, Isabela Felchak”. Seu play inicia `surpresa.mp4`, salvo na mesma pasta do site. Recarregue a página para rever a sequência.
6. Quando a gravação termina, o vídeo desaparece suavemente e aparecem flores amarelas e azuis com “Você é uma pessoa especial” no centro. Pausar o vídeo antes do fim não dispara essa tela.

Cliques repetidos durante transições são ignorados. Movimento reduzido elimina deslocamentos e mantém o coração estático após o clique. O foco segue para o container ao concluir a transição. Não há reprodução automática.

## Personalizar

- Nome e mensagem: `index.html`.
- Cores, flores e animações: `styles.css` e `script.js`.
- Vídeo atual: `surpresa.mp4`, na mesma pasta de `index.html`. Para substituir a gravação, troque esse arquivo mantendo o nome ou atualize `VIDEO_URL` no início de `script.js`.
- Prefira MP4 com vídeo H.264 e áudio AAC para maior compatibilidade. O player aceita gravação vertical ou horizontal, preservando sua proporção, com controles nativos e sem fullscreen obrigatório.
- Enquanto `VIDEO_URL` estiver vazio, nenhum arquivo de vídeo é solicitado. Se o arquivo configurado falhar, uma mensagem amigável substitui o player.

Não há serviços externos, rastreamento nem fontes que dependam de internet. Hospedagem e QR code ficam para quando houver uma URL real.
