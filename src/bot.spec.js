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
import {
    getNextSnakeMove, getRatings, rate, myBody, mySnake, eatTheStone, getMyLength, calculateLength, getDirection,
    getAllEnemiesPositions
} from './bot';
import {
    COMMANDS, ELEMENT
} from './constants';
import {findNearest, getAllElementPositions, getElementByXY, getHeadPosition} from "./utils";

describe("bot", () => {
    describe("getNextSnakeMove", ()=> {
        const mockLogger = () => {
        };

        it("should define method", () => {
            expect(getNextSnakeMove).toBeDefined();
        });
        it("should avoid horisontal wall", () => {
            const board =
                '*****' +
                '*   *' +
                '*   *' +
                '* ═►*' +
                '*****';
            const move = getNextSnakeMove(board, mockLogger);
            expect(move).toEqual(COMMANDS.UP);
        });
        it("should avoid wall", () => {
            const board =
                '*****' +
                '* ═►*' +
                '*   *' +
                '*   *' +
                '*****';
            const move = getNextSnakeMove(board, mockLogger);
            expect(move).toEqual(COMMANDS.DOWN);
        });

        it("should try to catch apples", () => {
            const board =
                '******' +
                '* ═► *' +
                '*  ○ *' +
                '*    *' +
                '*    *' +
                '******';
            const move = getNextSnakeMove(board, mockLogger);
            expect(move).toEqual(COMMANDS.DOWN);
        });

        it("should try to catch gold", () => {
            const board =
                '******' +
                '*  $ *' +
                '* =► *' +
                '*  ○ *' +
                '*    *' +
                '******';
            const move = getNextSnakeMove(board, mockLogger);
            expect(move).toEqual(COMMANDS.UP);
        });


        it("should avoid trappy apple", () => {
            const board =
                '☼☼☼☼☼☼☼☼☼☼☼' +
                '☼         ☼' +
                '☼   ☼☼☼☼☼☼☼' +
                '☼   ☼○   ☼☼' +
                '☼   ☼☼☼☼☼☼☼' +
                '☼         ☼' +
                '☼   ═►    ☼' +
                '☼         ☼' +
                '☼         ☼' +
                '☼    ○    ☼' +
                '☼☼☼☼☼☼☼☼☼☼☼';

            const move = getNextSnakeMove(board, mockLogger);
            expect(move).toEqual(COMMANDS.DOWN);
        });

        it("should avoid trappy path", () => {
            const board =
                '☼☼☼☼☼☼☼☼☼☼☼☼' +
                '☼        ○ ☼' +
                '☼  ☼☼   ☼☼ ☼' +
                '☼  ☼ ☼ ☼ ☼ ☼' +
                '☼  ☼  ☼ ▲☼ ☼' +
                '☼       ║  ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼☼☼☼☼☼☼☼☼☼☼☼';

            const move = getNextSnakeMove(board, mockLogger);
            expect(move).toEqual(COMMANDS.LEFT);
        });

        it('should eat the stone', () => {
            const board =
                '******' +
                '* ╔═ *' +
                '* ║ ●*' +
                '* ╚═►*' +
                '*    *' +
                '******';
            const move = getNextSnakeMove(board, mockLogger);
            expect(move).toEqual(COMMANDS.UP+' '+COMMANDS.ACT);
        });

        it('should not eat the stone', () => {
            const board =
                '******' +
                '*    *' +
                '* ╔ ●*' +
                '* ╚═►*' +
                '*    *' +
                '******';
            const move = getNextSnakeMove(board, mockLogger);
            expect(move).toEqual(COMMANDS.DOWN);
        });

        it('should attack the enemy', () => {
            const board =
                '☼☼☼☼☼' +
                '☼ $ ☼' +
                '☼═♥○☼' +
                '☼ < ☼' +
                '☼☼☼☼☼';
            const move = getNextSnakeMove(board, mockLogger);
            expect(move).toEqual(COMMANDS.DOWN);
        });

        it('should pursue the enemy', () => {
            const board =
                '☼☼☼☼☼☼☼☼☼☼☼☼' +
                '☼        ○ ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼  <    ♥  ☼' +
                '☼       ║  ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼☼☼☼☼☼☼☼☼☼☼☼';

            const move = getNextSnakeMove(board, mockLogger);
            expect(move).toEqual(COMMANDS.LEFT);
        });

        it('should not pursue the enemy', () => {
            const board =
                '☼☼☼☼☼☼☼☼☼☼☼☼' +
                '☼        ○ ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼  <     ♥ ☼' +
                '☼        ║ ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼          ☼' +
                '☼☼☼☼☼☼☼☼☼☼☼☼';

            const move = getNextSnakeMove(board, mockLogger);
            expect(move).toEqual(COMMANDS.UP);
        });

        it('exclude the element near enemy head', () => {
            const board =
                '☼☼☼☼☼☼☼☼☼' +
                '☼       ☼' +
                '☼─────>○☼' +
                '☼       ☼' +
                '☼      ▲☼' +
                '☼      ║☼' +
                '☼       ☼' +
                '☼       ☼' +
                '☼☼☼☼☼☼☼☼☼';

            const move = getNextSnakeMove(board, mockLogger);
            expect(move).toEqual(COMMANDS.LEFT);
        });

        it('should avoid enemy head', () => {
            const board =
                '☼☼☼☼☼☼☼☼☼' +
                '☼       ☼' +
                '☼─────>○☼' +
                '☼      ▲☼' +
                '☼      ║☼' +
                '☼       ☼' +
                '☼       ☼' +
                '☼       ☼' +
                '☼☼☼☼☼☼☼☼☼';

            const move = getNextSnakeMove(board, mockLogger);
            expect(move).toEqual(COMMANDS.LEFT);
        });
    });

    describe("getRatings", ()=> {
        it('should return correct ratings', () => {
            const board =
                '******' +
                '*  =►*' +
                '*    *' +
                '*    *' +
                '*    *' +
                '******';
            const position = getHeadPosition(board);
            const res = [-Infinity, -Infinity, -Infinity, 0];
            const result = getRatings(board, position, [])

            expect(result).toEqual(res);
        });

        it('should rate wall correctly', () => {
            const board =
                '******' +
                '*  =►*' +
                '*    *' +
                '*    *' +
                '*    *' +
                '******';
            const position = getHeadPosition(board);
            position.x++;
            const apple = [];
            const result = rate(board, position, apple);
            expect(result).toEqual(-Infinity);
        });

        it('should rate apple correctly', () => {
            const board =
                '******' +
                '*  =►*' +
                '*   ○*' +
                '*    *' +
                '*    *' +
                '******';
            const position = getHeadPosition(board);
            position.y++;
            const result = rate(board, position, []);
            expect(result).toEqual(20);
        });

        it('should rate gold correctly', () => {
            const board =
                '******' +
                '*  =►*' +
                '*   $*' +
                '*    *' +
                '*    *' +
                '******';
            const position = getHeadPosition(board);
            position.y++;
            const result = rate(board, position, []);
            expect(result).toEqual(40);
        });

        it('should rate furry correctly', () => {
            const board =
                '******' +
                '*  =►*' +
                '*   ®*' +
                '*    *' +
                '*    *' +
                '******';
            const position = getHeadPosition(board);
            position.y++;
            const result = rate(board, position, []);
            expect(result).toEqual(60);
        });

        it('should rate flying pill correctly', () => {
            const board =
                '******' +
                '*  =►*' +
                '*   ©*' +
                '*    *' +
                '*    *' +
                '******';
            const position = getHeadPosition(board);
            position.y++;
            const result = rate(board, position, []);
            expect(result).toEqual(10000);
        });

        it('should rate default correctly', () => {
            const board =
                '******' +
                '*  =►*' +
                '*   8*' +
                '*    *' +
                '*    *' +
                '******';
            const position = getHeadPosition(board);
            position.y++;
            const result = rate(board, position, []);
            expect(result).toEqual(-Infinity);
        });

        it('should return my body element', () => {
            const element = ELEMENT.TAIL_END_LEFT;
            const result = mySnake(element);

            expect(result).toEqual(element);
        });

        it('should be return true if body more than 5', () => {
            const body = 6;
            const result = eatTheStone(body);
            expect(result).toEqual(true);
        });

        it('should be return false if body less or equal than 4', () => {
            const body = 4;
            const result = eatTheStone(body);
            expect(result).toEqual(false);
        });

        it('should rate stone correctly', () => {
            const board =
                '******' +
                '* ╔═ *' +
                '* ║ ●*' +
                '* ╚═►*' +
                '*    *' +
                '******';
            const position = getHeadPosition(board);
            position.y--;
            const result = rate(board, position, []);
            expect(result).toEqual(10);
        });
    });

    it('should calculate length properly', () => {
        const board =
            '******' +
            '* ╔═►*' +
            '* ║ 8*' +
            '* ╚╗ *' +
            '* ╔╝ *' +
            '******';
        const length = 8;
        const result = getMyLength(board);
        expect(result).toEqual(length);
    });

    it('should calculate length properly', () => {
        const board =
            '******' +
            '* ◄═╗*' +
            '* ╔ ║*' +
            '* ╚═╝*' +
            '*    *' +
            '******';
        const length = 8;
        const result = getMyLength(board);
        expect(result).toEqual(length);
    });

    it('should get all enemies position', () => {
        const board =
            '******' +
            '* ○ >*' +
            '* =► *' +
            '* ♣× *' +
            '* ─┘│*' +
            '******';
        const res = [
            {x: 4, y: 1},
            {x: 3, y: 3},
            {x: 2, y: 4},
            {x: 3, y: 4},
            {x: 4, y: 4},
        ];
        const result = getAllEnemiesPositions(board);
        expect(result).toEqual(res);
    });

    it('should calculate length properly II', () => {
        const board =
            '*******' +
            '* ╔═► *' +
            '* ║ 8 *' +
            '* ╚╗  *' +
            '* ╔╝  *' +
            '*     *' +
            '*******';
        const length = 8;
        const result = getMyLength(board);
        expect(result).toEqual(length);
    });
});