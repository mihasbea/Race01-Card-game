CREATE DATABASE IF NOT EXISTS card_game;
USE card_game;

CREATE TABLE if NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    coins INT DEFAULT 0,
    wins INT DEFAULT 0,
    lost INT DEFAULT 0,
    winrate DECIMAL(5, 2) DEFAULT 0.00,
    avatar MEDIUMBLOB,
    avatar_preset VARCHAR(50) DEFAULT NULL
);

CREATE TABLE if NOT EXISTS battles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    battle_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    units_deployed INT DEFAULT 0,
    turns INT DEFAULT 0,
    user1_id INT,
    user2_id INT,
    winner_id INT,

    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);