// DOM elementai
const gameContainer = document.getElementById('game-container');
const playerNameInput = document.getElementById('player-name');
const startGameButton = document.getElementById('start-game');
const showLeaderboardButton = document.getElementById('show-leaderboard');
const leaderboardList = document.getElementById('leaderboard-list');
const gameOverDisplay = document.getElementById('game-over');
const difficultyButtons = document.querySelectorAll('#difficulty button');

// Kintamieji
let playerName = '';
let selectedLevel = 4;
let cardValues = [];
let flippedCards = [];
let mistakes = 0;
let score = 0;
let leaderboards = JSON.parse(localStorage.getItem('leaderboards')) || {
    4: [],
    6: [],
    8: []
};
let gameStarted = false;

// Pagalbinės funkcijos
function saveLeaderboards() {
    localStorage.setItem('leaderboards', JSON.stringify(leaderboards));
}

function generateCardValues(level) {
    const totalCards = level * level;
    const values = Array.from({ length: totalCards / 2 }, (_, i) => i + 1);
    return [...values, ...values].sort(() => Math.random() - 0.5);
}

function renderGame(level) {
    gameContainer.innerHTML = '';
    gameContainer.style.gridTemplateColumns = `repeat(${level}, 1fr)`;
    cardValues = generateCardValues(level);

    cardValues.forEach((value, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = value;
        card.dataset.index = index;
        card.textContent = '';
        gameContainer.appendChild(card);
    });
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        cardValues.forEach((_, index) => {
            const card = gameContainer.querySelector(`[data-index='${index}']`);
            card.textContent = card.dataset.value;
        });

        setTimeout(() => {
            document.querySelectorAll('.card').forEach(card => {
                card.textContent = '';
                card.classList.remove('flipped');
                card.addEventListener('click', handleCardClick);
            });
        }, 4000);
    }
}

function handleCardClick(e) {
    const card = e.target;
    if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
        card.classList.add('flipped');
        card.textContent = card.dataset.value;
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            checkMatch();
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.value === card2.dataset.value) {
        setTimeout(() => {
            card1.style.visibility = 'hidden';
            card2.style.visibility = 'hidden';
            flippedCards = [];
            score++;
            checkWin();
        }, 500);
    } else {
        mistakes++;
        if (mistakes >= 6) {
            endGame(false);
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                card1.textContent = '';
                card2.textContent = '';
                flippedCards = [];
            }, 1000);
        }
    }
}

function checkWin() {
    if (document.querySelectorAll('.card.flipped').length === cardValues.length) {
        endGame(true);
    }
}

function endGame(win) {
    gameOverDisplay.textContent = win ? `You Win! Score: ${score}` : `Game Over! Score: ${score}`;

    leaderboards[selectedLevel].push({ name: playerName, score });
    leaderboards[selectedLevel].sort((a, b) => b.score - a.score);
    saveLeaderboards();

    setTimeout(() => {
        resetGame();
    }, 3000);

    showLeaderboard();
}

function resetGame() {
    mistakes = 0;
    score = 0;
    flippedCards = [];
    gameStarted = false;
    renderGame(selectedLevel);
    gameOverDisplay.textContent = '';
}

function showLeaderboard() {
    leaderboardList.innerHTML = '';
    const leaderboard = leaderboards[selectedLevel] || [];

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li>No scores yet.</li>';
    } else {
        leaderboard.forEach(({ name, score }) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${name}: ${score}`;
            leaderboardList.appendChild(listItem);
        });
    }

    document.getElementById('leaderboard').style.display = 'block';
}

function loadLeaderboards() {
    const storedLeaderboards = localStorage.getItem('leaderboards');
    if (storedLeaderboards) {
        leaderboards = JSON.parse(storedLeaderboards);
    }
}

// Alertu managinimas
startGameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name!');
        return;
    }
    resetGame();
    startGame();
});

showLeaderboardButton.addEventListener('click', () => {
    showLeaderboard();
});

difficultyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        selectedLevel = parseInt(e.target.dataset.level, 10);
        resetGame();
    });
});

// Pradinis žaidimo inicializavimas
loadLeaderboards();
renderGame(selectedLevel);
