<?php
/**
 * Salva pontuação de Space Invaders em arquivo JSON local seguro
 */
header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . '/highscores.json';

if (!file_exists($dataFile)) {
    $initial = [
        ['name' => 'AAA', 'score' => 9990, 'date' => date('Y-m-d')],
        ['name' => 'TAITO', 'score' => 5000, 'date' => date('Y-m-d')],
        ['name' => '4U.IA', 'score' => 2500, 'date' => date('Y-m-d')],
        ['name' => 'PILOT', 'score' => 1200, 'date' => date('Y-m-d')],
        ['name' => 'ROOKIE', 'score' => 800, 'date' => date('Y-m-d')]
    ];
    file_put_contents($dataFile, json_encode($initial, JSON_PRETTY_PRINT));
}

$scores = json_decode(file_get_contents($dataFile), true) ?: [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = strtoupper(trim(substr($_POST['name'] ?? 'PILOT', 0, 10)));
    $score = intval($_POST['score'] ?? 0);

    if ($score > 0) {
        $scores[] = [
            'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
            'score' => $score,
            'date' => date('Y-m-d')
        ];

        // Ordena por pontuação decrescente
        usort($scores, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        // Mantém top 20
        $scores = array_slice($scores, 0, 20);
        file_put_contents($dataFile, json_encode($scores, JSON_PRETTY_PRINT));
    }

    if (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
        echo json_encode(['status' => 'success', 'scores' => $scores]);
        exit;
    }

    header("Location: show_highscore.php");
    exit;
}

echo json_encode(['status' => 'ok', 'scores' => $scores]);
