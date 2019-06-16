const config = require('../config');

class Character {
    constructor(userId, level, experience, statistics, money, currentHealth) {
        this.userId = userId;
        this.level = level;
        this.experience = experience;
        this.statistics = statistics;
        this.money = money;
        this.currentHealth = currentHealth;
    }
}

class Statistics {
    constructor(statPoints, health, strength, agility, intelligence) {
        this.statPoints = statPoints;
        this.health = health;
        this.strength = strength;
        this.agility = agility;
        this.intelligence = intelligence;
    }
}

exports.calcExperienceRequired = function (level) {
    return Math.pow(level, 2) / 0.04;
};

exports.levelUpCharacter = function (character) {
    character.experience = character.experience - this.calcExperienceRequired(character.level);
    character.level += 1;
    
    let statistics = character.statistics;
    statistics.statPoints += config.statPointsPerLevel;

    let health = statistics.health + config.healthPointsPerLevel;
    let newStatistics = new Statistics(statistics.statPoints, health, statistics.strength, statistics.agility, statistics.intelligence);

    return new Character(character.userId, character.level, character.experience, newStatistics, character.money, health);
};

exports.createNewCharacter = function (userId) {
    let level = 1;
    let experience = 0;
    let statPoints = 0;
    let health = 5; // level 1 health value for now
    let strength = 1;
    let agility = 1;
    let intelligence = 1;
    let money = 0;
    let currentHealth = health;

    let statistics = new Statistics(statPoints, health, strength, agility, intelligence);

    return new Character(userId, level, experience, statistics, money, currentHealth);
};

exports.validateStatistics = function (stats, updatedStats) {
    let statPointsDiff = stats.statPoints - updatedStats.statPoints;
    if (statPointsDiff < 0) {
        return false;
    }
    
    if (updatedStats.health < stats.health || updatedStats.strength < stats.strength
         || updatedStats.agility < stats.agility || updatedStats.intelligence < stats.intelligence) {
        return false;
    }

    let statsTotal = stats.health + stats.strength + stats.agility + stats.intelligence;
    let updatedStatTotals = updatedStats.health + updatedStats.strength + updatedStats.agility + updatedStats.intelligence;
    let statDiff = updatedStatTotals - statsTotal;

    if (statPointsDiff !== statDiff) {
        return false;
    }

    return true;
};
