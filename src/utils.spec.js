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
    getBoardSize,
    getElementByXY,
    getFirstPositionOf,
    isAt,
    getAt,
    isNear,
    getAllElementPositions,
    findNearest,
    getDistance,
    getSurroundsCoord,
    moveUp,
    moveRight,
    moveDown,
    moveLeft,
    isAtrap,
    moveTo
} from './utils';
import {
    ELEMENT
} from './constants';

describe("utils", () => {
    describe("getBoardSize", () => {
        it("should return board size", () => {
            const size = getBoardSize('****');
            expect(size).toEqual(2);
        });
    });

    describe("getElementByXY", () => {
        it("should returned specified element for (0,0)", () => {
            // 123|456|789
            const board = '123456789';
            const element = getElementByXY(board, {x: 0, y: 0});
            expect(element).toEqual("1");
        });

        it("should returned specified element for (2,1)", () => {
            // 123|456|789
            const board = '123456789';
            const element = getElementByXY(board, {x: 2, y: 1});
            expect(element).toEqual("6");
        });
    });

    describe("getFirstPositionOf", () => {
        it("should return first match", () => {
            const board = '123456789';
            const position = getFirstPositionOf(board, ['6', '9']);
            expect(position).toEqual({x: 2, y: 1});
        });
    });

    describe("isAt", () => {
        it("should return false for incorrect coords", () => {
            const board = '123456789';
            const res = isAt(board, 6, 3, ELEMENT.NONE);
            expect(res).toEqual(false);
        });

        it("should return 6 for (2,1)", () => {
            const board = '12345 789';
            const res = isAt(board, 2, 1, ELEMENT.NONE);
            expect(res).toEqual(true);
        });
    });

    describe("getAt", () => {
        it("should return WALL for incorrect coords", () => {
            const board = '123456789';
            const res = getAt(board, 6, 1);
            expect(res).toEqual(ELEMENT.WALL);
        });
        it("should return element for specified coords", () => {
            const board = '12345 789';
            const res = getAt(board, 2, 1);
            expect(res).toEqual(ELEMENT.NONE);
        });
    });

    describe("isNear", () => {
        it("should return WALL for incorrect coords", () => {
            const board =
                '******' +
                '* ═► *' +
                '*  ○ *' +
                '*    *' +
                '*    *' +
                '******';
            const res = isNear(board, 3, 1, '○');
            expect(res).toEqual(true);
        });
    });

    describe("get elements", () => {
        it("sohuld return empty array if elements not found", () => {
            const board =
                '******' +
                '* ○  *' +
                '* =► *' +
                '*  ○ *' +
                '* ○○○*' +
                '******';
            const res = [];
            const result = getAllElementPositions(board, ELEMENT.GOLD);
            expect(result).toEqual(res);
        });
        it("should find all apples positions", () => {
            const board =
                '******' +
                '* ○ $*' +
                '* =► *' +
                '*  ○ *' +
                '* ○○○*' +
                '******';
            const res = [
                {x: 2, y: 1},
                {x: 3, y: 3},
                {x: 2, y: 4},
                {x: 3, y: 4},
                {x: 4, y: 4},
            ];
            const result = getAllElementPositions(board, ELEMENT.APPLE);
            expect(result).toEqual(res);
        });
        it("should find all golds positions", () => {
            const board =
                '******' +
                '* ○ $*' +
                '* =► *' +
                '* $○ *' +
                '* ○○○*' +
                '******';
            const res = [
                {x: 4, y: 1},
                {x: 2, y: 3},
            ]
            const result = getAllElementPositions(board, ELEMENT.GOLD);
            expect(result).toEqual(res);
        });
        it("should define if element in a trap", () => {
            const board =
                '☼☼☼☼☼☼' +
                '☼○☼  ☼' +
                '☼ =► ☼' +
                '☼    ☼' +
                '☼    ☼' +
                '☼☼☼☼☼☼';
            const position = {x: 1, y: 1}
            const result = isAtrap(board, position);
            expect(result).toEqual(true);
        });

        it("should not define if element in a trap", () => {
            const board =
                '☼☼☼☼☼☼' +
                '☼ ○☼ ☼' +
                '☼ =► ☼' +
                '☼    ☼' +
                '☼    ☼' +
                '☼☼☼☼☼☼';
            const position = {x: 2, y: 1}
            const result = isAtrap(board, position);
            expect(result).toEqual(false);
        });

    });

    describe("find nearest from corner", () => {
        it("should find nearest apple I", () => {
            const currentPosition = {x: 1, y: 1};
            const elements = [
                {x: 1, y: 2},
                {x: 2, y: 1},
                {x: 5, y: 3}
            ];
            const result = findNearest(currentPosition, elements)

            const res = {x: 1, y: 2};
            expect(result).toEqual(res);
        });

        it("should find nearest apple II", () => {
            const currentPosition = {x: 1, y: 1};
            const elements = [
                {x: 5, y: 4},
                {x: 5, y: 3}
            ];
            const result = findNearest(currentPosition, elements)

            const res = {x: 5, y: 3};
            expect(result).toEqual(res);
        });

        it("should find nearest apple III", () => {
            const currentPosition = {x: 1, y: 1};
            const elements = [
                {x: 5, y: 4},
                {x: 5, y: 3},
                {x: 4, y: 5},
                {x: 5, y: 5},
            ];
            const result = findNearest(currentPosition, elements)

            const res = {x: 5, y: 3};
            expect(result).toEqual(res);
        });
    });

    describe("get distance", () => {
        it("should return 0 if not calculable", () => {
            const res = 0;
            const from = [];
            const to = {x: 2, y: 1}
            const result = getDistance(from, to);
            expect(result).toEqual(res);
        });

        it("should be calculate distance properly", () => {
            const res = 2;
            const from = {x: 0, y: 0};
            const to = {x: 2, y: 0};
            const result = getDistance(from, to);
            expect(result).toEqual(res);
        });

        it("should be calculate distance properly diagonal", () => {
            const res = 2;
            const from = {x: 0, y: 0};
            const to = {x: 1, y: 1};
            const result = Math.ceil(getDistance(from, to));
            expect(result).toEqual(res);
        });
    });

    describe("get surrounds", () => {
        it("should return surround coordinates properly", () => {
            const position = {x: 3, y: 3};
            const res = [
                {x: 2, y: 3},
                {x: 3, y: 2},
                {x: 4, y: 3},
                {x: 3, y: 4}
            ];
            const result = getSurroundsCoord(position);
            expect(result).toEqual(res);
        });
    });

    describe('moves', () => {
        it('should move up', () => {
            const position = {x: 2, y: 2};
            const res = {x: 2, y: 1};
            const result = moveUp(position);
            expect(result).toEqual(res);
        });

        it('should move right', () => {
            const position = {x: 2, y: 2};
            const res = {x: 3, y: 2};
            const result = moveRight(position);
            expect(result).toEqual(res);
        });

        it('should move down', () => {
            const position = {x: 2, y: 2};
            const res = {x: 2, y: 3};
            const result = moveDown(position);
            expect(result).toEqual(res);
        });

        it('should move left', () => {
            const position = {x: 2, y: 2};
            const res = {x: 1, y: 2};
            const result = moveLeft(position);
            expect(result).toEqual(res);
        });
    });

    describe('moves string', () => {
       it('should moves up', () => {
           const position = {x: 2, y: 2};
           const res = {x:2, y: 1};
           const result = moveTo(position, 'UP');
           expect(result).toEqual(res);
       });

        it('should moves up', () => {
            const position = {x: 2, y: 2};
            const res = {x:3, y: 2};
            const result = moveTo(position, 'RIGHT');
            expect(result).toEqual(res);
        });

        it('should moves up', () => {
            const position = {x: 2, y: 2};
            const res = {x:2, y: 3};
            const result = moveTo(position, 'DOWN');
            expect(result).toEqual(res);
        });

        it('should moves up', () => {
            const position = {x: 2, y: 2};
            const res = {x:1, y: 2};
            const result = moveTo(position, 'LEFT');
            expect(result).toEqual(res);
        });
    });
});
