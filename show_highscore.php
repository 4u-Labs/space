<?php
$dataFile = __DIR__ . '/highscores.json';

if (!file_exists($dataFile)) {
    $scores = [
        ['name' => 'AAA', 'score' => 9990, 'date' => date('Y-m-d')],
        ['name' => 'TAITO', 'score' => 5000, 'date' => date('Y-m-d')],
        ['name' => '4U.IA', 'score' => 2500, 'date' => date('Y-m-d')],
        ['name' => 'PILOT', 'score' => 1200, 'date' => date('Y-m-d')],
        ['name' => 'ROOKIE', 'score' => 800, 'date' => date('Y-m-d')]
    ];
    file_put_contents($dataFile, json_encode($scores, JSON_PRETTY_PRINT));
} else {
    $scores = json_decode(file_get_contents($dataFile), true) ?: [];
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Highscores — Space Invaders | 4U.IA.BR</title>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@600&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            text-align: center;
            color: #00ff66;
            font-family: 'Press Start 2P', monospace;
            background-color: #05060c;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        h1 {
            font-size: 1.5rem;
            color: #ff3344;
            text-shadow: 0 0 10px rgba(255, 51, 68, 0.7);
            margin-bottom: 25px;
            letter-spacing: 2px;
        }
        .table-container {
            width: 100%;
            max-width: 480px;
            background: rgba(8, 12, 24, 0.95);
            border: 2px solid #00ff66;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 255, 102, 0.3);
            padding: 15px;
            margin-bottom: 25px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            color: #ffff00;
            font-size: 0.8rem;
            padding: 10px;
            border-bottom: 2px solid rgba(0, 255, 102, 0.4);
        }
        td {
            padding: 10px 8px;
            font-size: 0.75rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            color: #ffffff;
        }
        tr:hover td {
            color: #00ff66;
            background: rgba(0, 255, 102, 0.05);
        }
        .btn-back {
            display: inline-block;
            font-family: 'Press Start 2P', monospace;
            font-size: 0.8rem;
            color: #05060c;
            background: #00ff66;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            box-shadow: 0 0 15px rgba(0, 255, 102, 0.5);
            transition: all 0.2s ease;
        }
        .btn-back:hover {
            background: #ffff00;
            box-shadow: 0 0 20px #ffff00;
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <h1>HIGHSCORES</h1>
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>RANK</th>
                    <th>PILOTO</th>
                    <th>PONTOS</th>
                </tr>
            </thead>
            <tbody>
                <?php $rank = 1; foreach ($scores as $s): ?>
                <tr>
                    <td>#<?= $rank++ ?></td>
                    <td><?= htmlspecialchars($s['name']) ?></td>
                    <td><?= str_pad($s['score'], 5, '0', STR_PAD_LEFT) ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <a href="index.html" class="btn-back">◀ VOLTAR AO JOGO</a>
</body>
</html>
