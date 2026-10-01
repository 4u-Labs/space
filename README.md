# Space Invaders 1978 — Clássico Arcade 👾🕹️

<p align="center">
  <a href="https://4u.ia.br/app/space/"><img src="https://img.shields.io/badge/Jogar_Online-4u.ia.br%2Fapp%2Fspace-00ff66?style=for-the-badge&logo=google-chrome&logoColor=black" alt="Jogar Space Invaders Online" /></a>
  <a href="https://github.com/4u-Labs/space"><img src="https://img.shields.io/badge/GitHub-4u--Labs%2Fspace-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <img src="https://img.shields.io/badge/Tecnologia-HTML5_Canvas_%26_Vanilla_JS-ffff00?style=for-the-badge" alt="HTML5 Canvas" />
</p>

Recriação autêntica e de alta performance do clássico lendário **Space Invaders** (1978, Taito), desenvolvida nativamente com **HTML5 Canvas**, **Web Audio API** e **JavaScript Vanilla**, com gabinete retrô arcade e controles virtuais touch em tela cheia (`100dvh`) sem barra de rolagem.

Jogue agora no PC ou Celular em: [https://4u.ia.br/app/space/](https://4u.ia.br/app/space/)

---

## ✨ Funcionalidades e Mecânicas Clássicas

- **🛡️ 4 Bunkers de Defesa Destrutíveis:** Barreiras verdes que sofrem desgaste real e procedimental pixel a pixel (`destination-out`) ao serem atingidas por projéteis do jogador ou bombas dos invasores.
- **⚡ Marcha Acelerada Autêntica:** A frota de 55 invasores (Squid, Crab e Octopus) acelera progressivamente à medida que as unidades são eliminadas, sincronizando o ritmo de 4 notas (`fastinvader1` a `fastinvader4`).
- **🛸 Nave Mãe Misteriosa (UFO):** Passa periodicamente no topo da tela com sirene contínua (`ufo_lowpitch.wav`), concedendo bônus surpresa de 50, 100, 150 ou 300 pontos.
- **📱 Controles Touch Ergonômicos (Mobile 100dvh):** Botões dedicados de movimentação contínua (◀ / ▶) e disparo (🔴 DISPARO), além de suporte a toque direto nas metades do canvas.
- **🏆 Persistência de Recorde (High Score):** Salva localmente via `localStorage` e módulo PHP/JSON seguro para visualização de rankings.
- **🌊 Progressão por Ondas (Waves):** Novas hordas que começam mais baixas e com cadência de bombas mais agressiva.
- **⏸️ Atalhos de Teclado no PC:**
  - `Setas` ou `A / D`: Mover canhão
  - `Espaço`: Disparar laser
  - `P`: Pausar / Continuar
  - `N`: Novo Jogo
  - `S` ou `M`: Ligar / Desligar som

---

## 🚀 Como Executar Localmente

Não requer instalação de dependências ou build:

```bash
# Clone o repositório
git clone git@github.com:4u-Labs/space.git

# Acesse o diretório
cd space

# Inicie um servidor HTTP local
python3 -m http.server 8080
```

Abra no navegador em `http://localhost:8080`.

---

## 🛠️ Stack Tecnológica

- **HTML5 Canvas:** Renderização de matrizes de pixels com alta taxa de quadros (60 FPS) e manipulação gráfica de terreno destrutível.
- **CSS3:** Flexbox, gabinete arcade retrô neon e arquitetura responsiva `100dvh` para smartphones.
- **JavaScript Vanilla (ES6+):** Motor de física, colisão AABB e máscara por pixel, IA de frotas e pooling de áudio.

---

© 2026 [4U.IA.BR](https://4u.ia.br) // [4u-Labs](https://github.com/4u-Labs) — Todos os direitos reservados.
