/*-
 * #%L
 * Codenjoy - it's a dojo-like platform from developers to developers.
 * %%
 * Copyright (C) 2018 - 2019 Codenjoy
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.html>.
 * #L%
 */
import { ELEMENT, COMMANDS } from './constants';
import {
    isGameOver, getHeadPosition, getElementByXY, getSurroundsCoord, getAllElementPositions, findNearest, getDistance,
    isAtrap, getXYByPosition, isEnemy
} from './utils';

// Bot Example
export function getNextSnakeMove(board, logger) {
    // if (isGameOver(board)) {
    //     return '';
    // }
    // //My current position
    // const headPosition = getHeadPosition(board);
    // if (!headPosition) {
    //     return '';
    // }
    // logger('Head:' + JSON.stringify(headPosition));
    //
    // const surround = getSurround(board, headPosition); // (LEFT, UP, RIGHT, DOWN)
    // logger('Surround: ' + JSON.stringify(surround));
    //
    // //Get rating in LEFT, UP, RIGHT, DOWN priority
    // const raitings = surround.map(rateElement);
    // logger('Raitings:' + JSON.stringify(raitings));
    //
    // const command = getCommandByRaitings(raitings);
    //
    // return command;
    return maschinoff(board, logger);
}

function rateElement(element) {
    if (element === ELEMENT.NONE) {
        return 0;
    }

    if (element === ELEMENT.APPLE) {
        return 1;
    }

    if (element === ELEMENT.GOLD) {
        return 2;
    }

    return -1;
}

//Get ratings of commands
function getCommandByRaitings(raitings) {
    var indexToCommand = ['LEFT', 'UP', 'RIGHT', 'DOWN'];
    var maxIndex = 0;
    var max = -Infinity;
    for (var i = 0; i < raitings.length; i++) {
        var r = raitings[i];
        if (r > max) {
            maxIndex = i;
            max = r;
        }
    }

    return indexToCommand[maxIndex];
}

////Maschinoff day II
function maschinoff(board, logger){
    if (isGameOver(board)) {
        return '';
    }

    const headPosition = getHeadPosition(board);
    if (!headPosition) {
        return '';
    }
    logger('Head:' + JSON.stringify(headPosition));

    //Hunt apple if length less than 5
    const apples = getAllElementPositions(board, ELEMENT.APPLE);
    let hunt = findNearest(headPosition, apples);

    //Hunt Evil pill if it is nearest than gold
    const pills = getAllElementPositions(board, ELEMENT.FURY_PILL);
    let pill = findNearest(headPosition, pills);
    hunt = findNearest(headPosition, [hunt, pill]);

    //Hunt gold if it closer then or equal apple
    const golds = getAllElementPositions(board, ELEMENT.GOLD);
    const gold = findNearest(headPosition, golds);
    hunt = findNearest(headPosition, [hunt, gold]);

    //Hunt stone if length more than 5 and nearest than apple & gold
    if(eatTheStone(getMyLength(board))){
        const stones = getAllElementPositions(board, ELEMENT.STONE);
        const stone = findNearest(headPosition, stones);
        hunt = findNearest(headPosition, [hunt, stone]);
    }

    if(inFury(board)){
        //get position of the nearest enemy
        const enemies = getAllEnemiesPositions(board);
        const enemy = findNearest(headPosition, enemies);
        const distance = getDistance(headPosition, enemy);
        if(distance <= 5)
            hunt = enemy;
    }

    logger('Hunt:' + JSON.stringify(hunt));

    const ratings = getRatings(board, headPosition, hunt);

    const command = getCommandByRaitings(ratings);

    return command + dropTheStone(board);
}

function dropTheStone(board){
    return getMyLength(board) > 4 ? ' ACT' : '';
}

export function getRatings(board, position, apple){
    //LEFT, UP, RIGHT, DOWN
    const surrounds = getSurroundsCoord(position);
    return surrounds.map((position) => rate(board, position, apple))
}

export function rate(board, position, moveTo){
    let rate = -Infinity;
    const element = getElementByXY(board, position);
    switch (element){
        case enemySnake(element):
            rate = -10000;
            //if i'm in fury attack
            if(inFury(board)){
                rate = 100000
            }
            //if i'm longer attack
            break;
        //If Element is my body
        case mySnake(element):
            rate = -10;
            break;
        case ELEMENT.NONE:
            rate = 0;
            //Check if is it trappy point
            if(isAtrap(board, position) || isEnemy(board, position))
                rate = -Infinity;
            break;
        case ELEMENT.STONE:
            let lenght = getMyLength(board);
            if(eatTheStone(lenght))
                rate = 10;
            else
                rate = -1000;
            break;
        case ELEMENT.APPLE:
            rate = 20;
            break;
        case ELEMENT.GOLD:
            rate = 40;
            break;
        case ELEMENT.FURY_PILL:
            rate = 60;
            break;
        case ELEMENT.FLYING_PILL:
            rate = 10000;
            break;
        default:
            rate = -Infinity;
            break;
    }

    const distance = getDistance(position, moveTo);

    if(rate < 1 && distance > 0){
        //Subtract distance to element
        rate -= distance;
    }

    return rate;
}

function inFury(board){
    const fury = board.indexOf(ELEMENT.HEAD_EVIL);
    if(fury !== -1){
        return true;
    }
    return false;
}

export function getMyLength(board){
    return calculateLength(board);
}

export function calculateLength(board){
    const str = getSnake().join('');
    const snake = new RegExp('[^'+str+']', 'g');
    const length = board.replace(snake, "").length;
    return length;
}

export function eatTheStone(length){
    return length > 4 ? true : false;
}

export function enemySnake(element){
    const enemy = getEnemySnake();
    const index = enemy.indexOf(element);
    if(index !== -1){
        return enemy[index];
    }
    return false;
}

export function mySnake(element){
    const snake = getSnake();
    const index = snake.indexOf(element);
    if(index !== -1){
        return snake[index];
    }
    return false;
}

export function getAllEnemiesPositions(board){
    const positions = [];
    const enemyElements = getEnemySnake();
    for(let i = 0; i < board.length; i++){
        if(enemyElements.indexOf(board[i]) !== -1){
            positions.push(getXYByPosition(board, i));
        }
    }

    return positions.length ? positions : [];
}

export function getEnemySnake(){
    let enemy = [];
    return enemy.concat(getEnemyHeadElements(), getEnemyBodyElements(), getEnemyTailElements());
}

export function getEnemyHeadElements(){
    return [
        ELEMENT.ENEMY_HEAD_UP,
        ELEMENT.ENEMY_HEAD_DOWN,
        ELEMENT.ENEMY_HEAD_LEFT,
        ELEMENT.ENEMY_HEAD_RIGHT
    ]
}

export function getEnemyHeadBonusElements(){
    return [
        ELEMENT.ENEMY_HEAD_EVIL
    ]
}

function getEnemyBodyElements(){
    return [
        ELEMENT.ENEMY_BODY_HORIZONTAL,
        ELEMENT.ENEMY_BODY_LEFT_DOWN,
        ELEMENT.ENEMY_BODY_LEFT_UP,
        ELEMENT.ENEMY_BODY_RIGHT_DOWN,
        ELEMENT.ENEMY_BODY_RIGHT_UP,
        ELEMENT.ENEMY_BODY_VERTICAL,
    ]
}

function getEnemyTailElements(){
    return [
        ELEMENT.ENEMY_TAIL_END_DOWN,
        ELEMENT.ENEMY_TAIL_END_LEFT,
        ELEMENT.ENEMY_TAIL_END_RIGHT,
        ELEMENT.ENEMY_TAIL_END_UP,
    ]
}

function getSnake(){
    let snake = [];
    return snake.concat(getHeadElements(), getBodyElements(), getTailElements());

}

function getHeadElements(){
    const head = [];
    return head.concat(getRegularHead(), getBonusHead());
}

function getRegularHead(){
    return [
        ELEMENT.HEAD_DOWN,
        ELEMENT.HEAD_LEFT,
        ELEMENT.HEAD_RIGHT,
        ELEMENT.HEAD_UP,
        ELEMENT.HEAD_SLEEP,
        ELEMENT.HEAD_DEAD
    ]
}

function getBonusHead(){
    return [
        ELEMENT.HEAD_EVIL,
        ELEMENT.HEAD_FLY,
    ]
}

function getBodyElements(){
    return [
        ELEMENT.BODY_HORIZONTAL,
        ELEMENT.BODY_VERTICAL,
        ELEMENT.BODY_LEFT_DOWN,
        ELEMENT.BODY_LEFT_UP,
        ELEMENT.BODY_RIGHT_DOWN,
        ELEMENT.BODY_RIGHT_UP,
    ]
}

function getTailElements(){
    return [
        ELEMENT.TAIL_END_DOWN,
        ELEMENT.TAIL_END_LEFT,
        ELEMENT.TAIL_END_UP,
        ELEMENT.TAIL_END_RIGHT,
        ELEMENT.TAIL_INACTIVE
    ]
}