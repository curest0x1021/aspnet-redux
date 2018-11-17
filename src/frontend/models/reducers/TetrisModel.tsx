/***********************************************************************************
 *                                                                                  *
 *   Redux Reducers and React Context API Provider/Consumer for state TetrisModel   *
 *   Generated by ts2redux from Source file ../TetrisModel.ts                       *
 *                                                                                  *
 ***********************************************************************************/

export interface Cell {
  color: string;
}

export enum Colors {
  EMPTY = ""
}

export interface ActivePiece {
  x: number;
  y: number;
  width: number;
  height: number;
  cells: Cell[][];
}

const pieceDeclaration = (color: string, rows: string[]): ActivePiece => {
  const cells = new Array(rows.length);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    cells[i] = new Array(row.length);
    for (let c = 0; c < row.length; c++) {
      if (row.charAt(c) == " ") {
        cells[i][c] = { color: Colors.EMPTY };
      } else {
        cells[i][c] = { color: color };
      }
    }
  }
  return {
    x: 0,
    y: rows.length * -1,
    width: rows.length,
    height: rows.length,
    cells
  };
};

/**
 * [' O '],
 *  ['OOO'],
 *  [' O ']
 */

export const createNewPiece = (usingColor: string): ActivePiece => {
  const items = [
    pieceDeclaration(usingColor, ["xx", "xx"]),
    pieceDeclaration(usingColor, ["   ", "xxx", " x "]),
    pieceDeclaration(usingColor, [" x ", "xxx", " x "]),
    pieceDeclaration(usingColor, [" x ", " x ", "xx "]),
    pieceDeclaration(usingColor, [" x ", " x ", " xx"]),
    pieceDeclaration(usingColor, [" xx", "xxx", "xx "]),
    pieceDeclaration(usingColor, [" x  ", " x  ", " x  ", " x  "])
  ];
  return items[Math.floor(Math.random() * items.length)];
};

/**
 * @redux true
 */
export class TetrisModel {
  useColors: string[] = ["red", "blue", "green", "yellow", "brown"];
  lastUsedColor: number = 0;

  points: number = 0;

  rows: number = 20;
  cols: number = 10;
  cells: Cell[][] = [];

  activePiece: ActivePiece;
  gameOn: boolean = false;
  gameEnded: boolean = false;

  ticksPerMove: number = 10;
  tickCnt: number = 0;

  doesCollide(pieceX: number, pieceY: number, pieceCells?: Cell[][]): boolean {
    let collides = false;
    const compareAgainst = pieceCells || this.activePiece.cells;
    compareAgainst.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.color === Colors.EMPTY) return;
        if (pieceY + y >= this.rows) {
          collides = true;
          return;
        }
        if (pieceX + x < 0 || pieceX + x >= this.cols) {
          collides = true;
          return;
        }
        if (cell.color !== Colors.EMPTY) {
          if (pieceY + y < 0) return;
          if (this.cells[pieceY + y][pieceX + x].color !== Colors.EMPTY) {
            collides = true;
          }
        }
      });
    });
    return collides;
  }

  tick() {
    this.tickCnt++;
    if (this.tickCnt >= this.ticksPerMove) {
      this.tickCnt = 0;
      this.step();
    }
  }

  left() {
    if (!this.doesCollide(this.activePiece.x - 1, this.activePiece.y)) {
      this.activePiece.x--;
    }
  }
  right() {
    if (!this.doesCollide(this.activePiece.x + 1, this.activePiece.y)) {
      this.activePiece.x++;
    }
  }

  rotateCells(cells: Cell[][]): Cell[][] {
    const res: Cell[][] = new Array(cells.length);
    for (let j = 0; j < cells.length; j++) {
      res[j] = new Array(cells[j].length);
    }
    for (let j = 0; j < cells.length; j++) {
      const row = cells[j];
      for (let i = 0; i < row.length; i++) {
        res[i][j] = { color: Colors.EMPTY };
      }
    }
    for (let j = 0; j < cells.length; j++) {
      const row = cells[j];
      for (let i = 0; i < row.length; i++) {
        res[i][cells.length - j - 1] = row[i];
      }
    }
    return res;
  }

  rotate() {
    const newOrientation = this.rotateCells(this.activePiece.cells);
    if (
      !this.doesCollide(this.activePiece.x, this.activePiece.y, newOrientation)
    ) {
      this.activePiece.cells = newOrientation;
    }
  }

  step() {
    if (this.gameOn) {
      if (!this.doesCollide(this.activePiece.x, this.activePiece.y + 1)) {
        this.activePiece.y++;
      } else {
        if (this.activePiece.y < 0) {
          this.gameEnded = true;
          this.gameOn = false;
        } else {
          this.addPiece();
          this.dropRows();
          this.activePiece = createNewPiece(this.pickNextColor());
          this.activePiece.x = Math.floor(Math.random() * 5);
        }
      }
    }
  }

  pickNextColor(): string {
    this.lastUsedColor++;
    if (this.lastUsedColor >= this.useColors.length) {
      this.lastUsedColor = 0;
    }
    return this.useColors[this.lastUsedColor];
  }

  addPiece() {
    const piece = this.activePiece;
    piece.cells.forEach((row, y) => {
      if (piece.y + y < 0) return;
      row.forEach((cell, x) => {
        if (cell.color !== Colors.EMPTY) {
          this.cells[piece.y + y][piece.x + x].color = cell.color;
        }
      });
    });
  }

  dropRows() {
    const nextRows = [];
    let emptyCnt = 0;
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      if (row.filter(cell => cell.color === Colors.EMPTY).length > 0) {
        nextRows.push(row);
      } else {
        emptyCnt++;
      }
    }
    if (emptyCnt > 0) {
      this.points += emptyCnt * emptyCnt * 10;
      while (emptyCnt-- > 0) {
        const newEmpty = new Array(this.cols);
        for (let col = 0; col < this.cols; col++) {
          newEmpty[col] = { color: Colors.EMPTY };
        }
        nextRows.unshift(newEmpty);
      }
      this.cells = nextRows;
      this.ticksPerMove--;
    }
  }

  resetGame() {
    this.cells = new Array(this.rows);
    for (let row = 0; row < this.rows; row++) {
      this.cells[row] = new Array(this.cols);
      for (let col = 0; col < this.cols; col++) {
        this.cells[row][col] = { color: Colors.EMPTY };
      }
    }
    this.activePiece = createNewPiece(this.pickNextColor());
    this.ticksPerMove = 10;
    this.tickCnt = 0;
  }

  start() {
    this.resetGame();
    this.gameOn = true;
    this.gameEnded = false;
    this.points = 0;
  }
}
import * as immer from "immer";
import { createSelector } from "reselect";
import { connect } from "react-redux";
import { IState } from "./index";
import * as React from "react";

export interface IContainerPropsMethods {
  tick: () => any;
  left: () => any;
  right: () => any;
  rotate: () => any;
  step: () => any;
  addPiece: () => any;
  dropRows: () => any;
  resetGame: () => any;
  start: () => any;
}
export interface ITetrisModel {
  useColors: string[];
  lastUsedColor: number;
  points: number;
  rows: number;
  cols: number;
  cells: Cell[][];
  activePiece: ActivePiece;
  gameOn: boolean;
  gameEnded: boolean;
  ticksPerMove: number;
  tickCnt: number;
}
export const useColorsSelectorFn = (state: ITetrisModel): string[] =>
  state.useColors;
export const lastUsedColorSelectorFn = (state: ITetrisModel): number =>
  state.lastUsedColor;
export const pointsSelectorFn = (state: ITetrisModel): number => state.points;
export const rowsSelectorFn = (state: ITetrisModel): number => state.rows;
export const colsSelectorFn = (state: ITetrisModel): number => state.cols;
export const cellsSelectorFn = (state: ITetrisModel): Cell[][] => state.cells;
export const activePieceSelectorFn = (state: ITetrisModel): ActivePiece =>
  state.activePiece;
export const gameOnSelectorFn = (state: ITetrisModel): boolean => state.gameOn;
export const gameEndedSelectorFn = (state: ITetrisModel): boolean =>
  state.gameEnded;
export const ticksPerMoveSelectorFn = (state: ITetrisModel): number =>
  state.ticksPerMove;
export const tickCntSelectorFn = (state: ITetrisModel): number => state.tickCnt;

export type IContainerPropsState = ITetrisModel;
export interface IProps extends IContainerPropsState, IContainerPropsMethods {}
export const mapStateToProps = (state: IState): IContainerPropsState => {
  return {
    useColors: state.TetrisModel.useColors,
    lastUsedColor: state.TetrisModel.lastUsedColor,
    points: state.TetrisModel.points,
    rows: state.TetrisModel.rows,
    cols: state.TetrisModel.cols,
    cells: state.TetrisModel.cells,
    activePiece: state.TetrisModel.activePiece,
    gameOn: state.TetrisModel.gameOn,
    gameEnded: state.TetrisModel.gameEnded,
    ticksPerMove: state.TetrisModel.ticksPerMove,
    tickCnt: state.TetrisModel.tickCnt
  };
};
export const mapDispatchToProps = (dispatch: any): IContainerPropsMethods => {
  return {
    tick: () => {
      return dispatch(RTetrisModel.tick());
    },
    left: () => {
      return dispatch(RTetrisModel.left());
    },
    right: () => {
      return dispatch(RTetrisModel.right());
    },
    rotate: () => {
      return dispatch(RTetrisModel.rotate());
    },
    step: () => {
      return dispatch(RTetrisModel.step());
    },
    addPiece: () => {
      return dispatch(RTetrisModel.addPiece());
    },
    dropRows: () => {
      return dispatch(RTetrisModel.dropRows());
    },
    resetGame: () => {
      return dispatch(RTetrisModel.resetGame());
    },
    start: () => {
      return dispatch(RTetrisModel.start());
    }
  };
};
export const StateConnector = connect(
  mapStateToProps,
  mapDispatchToProps
);

const initTetrisModel = () => {
  const o = new TetrisModel();
  return {
    useColors: o.useColors,
    lastUsedColor: o.lastUsedColor,
    points: o.points,
    rows: o.rows,
    cols: o.cols,
    cells: o.cells,
    activePiece: o.activePiece,
    gameOn: o.gameOn,
    gameEnded: o.gameEnded,
    ticksPerMove: o.ticksPerMove,
    tickCnt: o.tickCnt
  };
};
const initWithMethodsTetrisModel = () => {
  const o = new TetrisModel();
  return {
    useColors: o.useColors,
    lastUsedColor: o.lastUsedColor,
    points: o.points,
    rows: o.rows,
    cols: o.cols,
    cells: o.cells,
    activePiece: o.activePiece,
    gameOn: o.gameOn,
    gameEnded: o.gameEnded,
    ticksPerMove: o.ticksPerMove,
    tickCnt: o.tickCnt,
    tick: o.tick,
    left: o.left,
    right: o.right,
    rotate: o.rotate,
    step: o.step,
    addPiece: o.addPiece,
    dropRows: o.dropRows,
    resetGame: o.resetGame,
    start: o.start
  };
};

/**
 * @generated true
 */
export class RTetrisModel {
  private _state?: ITetrisModel;
  private _dispatch?: (action: any) => void;
  private _getState?: () => any;
  constructor(
    state?: ITetrisModel,
    dispatch?: (action: any) => void,
    getState?: () => any
  ) {
    this._state = state;
    this._dispatch = dispatch;
    this._getState = getState;
  }
  get useColors(): string[] | undefined {
    if (this._getState) {
      return this._getState().TetrisModel.useColors;
    } else {
      if (this._state) {
        return this._state.useColors;
      }
    }
    return undefined;
  }
  set useColors(value: string[] | undefined) {
    if (this._state && typeof value !== "undefined") {
      this._state.useColors = value;
    } else {
      // dispatch change for item useColors
      if (this._dispatch) {
        this._dispatch({
          type: TetrisModelEnums.TetrisModel_useColors,
          payload: value
        });
      }
    }
  }
  get lastUsedColor(): number | undefined {
    if (this._getState) {
      return this._getState().TetrisModel.lastUsedColor;
    } else {
      if (this._state) {
        return this._state.lastUsedColor;
      }
    }
    return undefined;
  }
  set lastUsedColor(value: number | undefined) {
    if (this._state && typeof value !== "undefined") {
      this._state.lastUsedColor = value;
    } else {
      // dispatch change for item lastUsedColor
      if (this._dispatch) {
        this._dispatch({
          type: TetrisModelEnums.TetrisModel_lastUsedColor,
          payload: value
        });
      }
    }
  }
  get points(): number | undefined {
    if (this._getState) {
      return this._getState().TetrisModel.points;
    } else {
      if (this._state) {
        return this._state.points;
      }
    }
    return undefined;
  }
  set points(value: number | undefined) {
    if (this._state && typeof value !== "undefined") {
      this._state.points = value;
    } else {
      // dispatch change for item points
      if (this._dispatch) {
        this._dispatch({
          type: TetrisModelEnums.TetrisModel_points,
          payload: value
        });
      }
    }
  }
  get rows(): number | undefined {
    if (this._getState) {
      return this._getState().TetrisModel.rows;
    } else {
      if (this._state) {
        return this._state.rows;
      }
    }
    return undefined;
  }
  set rows(value: number | undefined) {
    if (this._state && typeof value !== "undefined") {
      this._state.rows = value;
    } else {
      // dispatch change for item rows
      if (this._dispatch) {
        this._dispatch({
          type: TetrisModelEnums.TetrisModel_rows,
          payload: value
        });
      }
    }
  }
  get cols(): number | undefined {
    if (this._getState) {
      return this._getState().TetrisModel.cols;
    } else {
      if (this._state) {
        return this._state.cols;
      }
    }
    return undefined;
  }
  set cols(value: number | undefined) {
    if (this._state && typeof value !== "undefined") {
      this._state.cols = value;
    } else {
      // dispatch change for item cols
      if (this._dispatch) {
        this._dispatch({
          type: TetrisModelEnums.TetrisModel_cols,
          payload: value
        });
      }
    }
  }
  get cells(): Cell[][] | undefined {
    if (this._getState) {
      return this._getState().TetrisModel.cells;
    } else {
      if (this._state) {
        return this._state.cells;
      }
    }
    return undefined;
  }
  set cells(value: Cell[][] | undefined) {
    if (this._state && typeof value !== "undefined") {
      this._state.cells = value;
    } else {
      // dispatch change for item cells
      if (this._dispatch) {
        this._dispatch({
          type: TetrisModelEnums.TetrisModel_cells,
          payload: value
        });
      }
    }
  }
  get activePiece(): ActivePiece | undefined {
    if (this._getState) {
      return this._getState().TetrisModel.activePiece;
    } else {
      if (this._state) {
        return this._state.activePiece;
      }
    }
    return undefined;
  }
  set activePiece(value: ActivePiece | undefined) {
    if (this._state && typeof value !== "undefined") {
      this._state.activePiece = value;
    } else {
      // dispatch change for item activePiece
      if (this._dispatch) {
        this._dispatch({
          type: TetrisModelEnums.TetrisModel_activePiece,
          payload: value
        });
      }
    }
  }
  get gameOn(): boolean | undefined {
    if (this._getState) {
      return this._getState().TetrisModel.gameOn;
    } else {
      if (this._state) {
        return this._state.gameOn;
      }
    }
    return undefined;
  }
  set gameOn(value: boolean | undefined) {
    if (this._state && typeof value !== "undefined") {
      this._state.gameOn = value;
    } else {
      // dispatch change for item gameOn
      if (this._dispatch) {
        this._dispatch({
          type: TetrisModelEnums.TetrisModel_gameOn,
          payload: value
        });
      }
    }
  }
  get gameEnded(): boolean | undefined {
    if (this._getState) {
      return this._getState().TetrisModel.gameEnded;
    } else {
      if (this._state) {
        return this._state.gameEnded;
      }
    }
    return undefined;
  }
  set gameEnded(value: boolean | undefined) {
    if (this._state && typeof value !== "undefined") {
      this._state.gameEnded = value;
    } else {
      // dispatch change for item gameEnded
      if (this._dispatch) {
        this._dispatch({
          type: TetrisModelEnums.TetrisModel_gameEnded,
          payload: value
        });
      }
    }
  }
  get ticksPerMove(): number | undefined {
    if (this._getState) {
      return this._getState().TetrisModel.ticksPerMove;
    } else {
      if (this._state) {
        return this._state.ticksPerMove;
      }
    }
    return undefined;
  }
  set ticksPerMove(value: number | undefined) {
    if (this._state && typeof value !== "undefined") {
      this._state.ticksPerMove = value;
    } else {
      // dispatch change for item ticksPerMove
      if (this._dispatch) {
        this._dispatch({
          type: TetrisModelEnums.TetrisModel_ticksPerMove,
          payload: value
        });
      }
    }
  }
  get tickCnt(): number | undefined {
    if (this._getState) {
      return this._getState().TetrisModel.tickCnt;
    } else {
      if (this._state) {
        return this._state.tickCnt;
      }
    }
    return undefined;
  }
  set tickCnt(value: number | undefined) {
    if (this._state && typeof value !== "undefined") {
      this._state.tickCnt = value;
    } else {
      // dispatch change for item tickCnt
      if (this._dispatch) {
        this._dispatch({
          type: TetrisModelEnums.TetrisModel_tickCnt,
          payload: value
        });
      }
    }
  }

  // is a reducer
  doesCollide(pieceX: number, pieceY: number, pieceCells?: Cell[][]): boolean {
    let collides = false;
    const compareAgainst = pieceCells || this.activePiece.cells;
    compareAgainst.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.color === Colors.EMPTY) return;
        if (pieceY + y >= this.rows) {
          collides = true;
          return;
        }
        if (pieceX + x < 0 || pieceX + x >= this.cols) {
          collides = true;
          return;
        }
        if (cell.color !== Colors.EMPTY) {
          if (pieceY + y < 0) return;
          if (this.cells[pieceY + y][pieceX + x].color !== Colors.EMPTY) {
            collides = true;
          }
        }
      });
    });
    return collides;
  }
  // is a reducer
  tick() {
    if (this._state) {
      this.tickCnt++;
      if (this.tickCnt >= this.ticksPerMove) {
        this.tickCnt = 0;
        this.step();
      }
    } else {
      if (this._dispatch) {
        this._dispatch({ type: TetrisModelEnums.TetrisModel_tick });
      }
    }
  }

  public static tick() {
    return (dispatcher: any, getState: any) => {
      new RTetrisModel(undefined, dispatcher, getState).tick();
    };
  }
  // is a reducer
  left() {
    if (this._state) {
      if (!this.doesCollide(this.activePiece.x - 1, this.activePiece.y)) {
        this.activePiece.x--;
      }
    } else {
      if (this._dispatch) {
        this._dispatch({ type: TetrisModelEnums.TetrisModel_left });
      }
    }
  }

  public static left() {
    return (dispatcher: any, getState: any) => {
      new RTetrisModel(undefined, dispatcher, getState).left();
    };
  }
  // is a reducer
  right() {
    if (this._state) {
      if (!this.doesCollide(this.activePiece.x + 1, this.activePiece.y)) {
        this.activePiece.x++;
      }
    } else {
      if (this._dispatch) {
        this._dispatch({ type: TetrisModelEnums.TetrisModel_right });
      }
    }
  }

  public static right() {
    return (dispatcher: any, getState: any) => {
      new RTetrisModel(undefined, dispatcher, getState).right();
    };
  }
  // is a reducer
  rotateCells(cells: Cell[][]): Cell[][] {
    const res: Cell[][] = new Array(cells.length);
    for (let j = 0; j < cells.length; j++) {
      res[j] = new Array(cells[j].length);
    }
    for (let j = 0; j < cells.length; j++) {
      const row = cells[j];
      for (let i = 0; i < row.length; i++) {
        res[i][j] = { color: Colors.EMPTY };
      }
    }
    for (let j = 0; j < cells.length; j++) {
      const row = cells[j];
      for (let i = 0; i < row.length; i++) {
        res[i][cells.length - j - 1] = row[i];
      }
    }
    return res;
  }
  // is a reducer
  rotate() {
    if (this._state) {
      const newOrientation = this.rotateCells(this.activePiece.cells);
      if (
        !this.doesCollide(
          this.activePiece.x,
          this.activePiece.y,
          newOrientation
        )
      ) {
        this.activePiece.cells = newOrientation;
      }
    } else {
      if (this._dispatch) {
        this._dispatch({ type: TetrisModelEnums.TetrisModel_rotate });
      }
    }
  }

  public static rotate() {
    return (dispatcher: any, getState: any) => {
      new RTetrisModel(undefined, dispatcher, getState).rotate();
    };
  }
  // is a reducer
  step() {
    if (this._state) {
      if (this.gameOn) {
        if (!this.doesCollide(this.activePiece.x, this.activePiece.y + 1)) {
          this.activePiece.y++;
        } else {
          if (this.activePiece.y < 0) {
            this.gameEnded = true;
            this.gameOn = false;
          } else {
            this.addPiece();
            this.dropRows();
            this.activePiece = createNewPiece(this.pickNextColor());
            this.activePiece.x = Math.floor(Math.random() * 5);
          }
        }
      }
    } else {
      if (this._dispatch) {
        this._dispatch({ type: TetrisModelEnums.TetrisModel_step });
      }
    }
  }

  public static step() {
    return (dispatcher: any, getState: any) => {
      new RTetrisModel(undefined, dispatcher, getState).step();
    };
  }
  // is a reducer
  pickNextColor(): string {
    this.lastUsedColor++;
    if (this.lastUsedColor >= this.useColors.length) {
      this.lastUsedColor = 0;
    }
    return this.useColors[this.lastUsedColor];
  }
  // is a reducer
  addPiece() {
    if (this._state) {
      const piece = this.activePiece;
      piece.cells.forEach((row, y) => {
        if (piece.y + y < 0) return;
        row.forEach((cell, x) => {
          if (cell.color !== Colors.EMPTY) {
            this.cells[piece.y + y][piece.x + x].color = cell.color;
          }
        });
      });
    } else {
      if (this._dispatch) {
        this._dispatch({ type: TetrisModelEnums.TetrisModel_addPiece });
      }
    }
  }

  public static addPiece() {
    return (dispatcher: any, getState: any) => {
      new RTetrisModel(undefined, dispatcher, getState).addPiece();
    };
  }
  // is a reducer
  dropRows() {
    if (this._state) {
      const nextRows = [];
      let emptyCnt = 0;
      for (let i = 0; i < this.cells.length; i++) {
        const row = this.cells[i];
        if (row.filter(cell => cell.color === Colors.EMPTY).length > 0) {
          nextRows.push(row);
        } else {
          emptyCnt++;
        }
      }
      if (emptyCnt > 0) {
        this.points += emptyCnt * emptyCnt * 10;
        while (emptyCnt-- > 0) {
          const newEmpty = new Array(this.cols);
          for (let col = 0; col < this.cols; col++) {
            newEmpty[col] = { color: Colors.EMPTY };
          }
          nextRows.unshift(newEmpty);
        }
        this.cells = nextRows;
        this.ticksPerMove--;
      }
    } else {
      if (this._dispatch) {
        this._dispatch({ type: TetrisModelEnums.TetrisModel_dropRows });
      }
    }
  }

  public static dropRows() {
    return (dispatcher: any, getState: any) => {
      new RTetrisModel(undefined, dispatcher, getState).dropRows();
    };
  }
  // is a reducer
  resetGame() {
    if (this._state) {
      this.cells = new Array(this.rows);
      for (let row = 0; row < this.rows; row++) {
        this.cells[row] = new Array(this.cols);
        for (let col = 0; col < this.cols; col++) {
          this.cells[row][col] = { color: Colors.EMPTY };
        }
      }
      this.activePiece = createNewPiece(this.pickNextColor());
      this.ticksPerMove = 10;
      this.tickCnt = 0;
    } else {
      if (this._dispatch) {
        this._dispatch({ type: TetrisModelEnums.TetrisModel_resetGame });
      }
    }
  }

  public static resetGame() {
    return (dispatcher: any, getState: any) => {
      new RTetrisModel(undefined, dispatcher, getState).resetGame();
    };
  }
  // is a reducer
  start() {
    if (this._state) {
      this.resetGame();
      this.gameOn = true;
      this.gameEnded = false;
      this.points = 0;
    } else {
      if (this._dispatch) {
        this._dispatch({ type: TetrisModelEnums.TetrisModel_start });
      }
    }
  }

  public static start() {
    return (dispatcher: any, getState: any) => {
      new RTetrisModel(undefined, dispatcher, getState).start();
    };
  }
}

export const TetrisModelEnums = {
  TetrisModel_useColors: "TetrisModel_useColors",
  TetrisModel_lastUsedColor: "TetrisModel_lastUsedColor",
  TetrisModel_points: "TetrisModel_points",
  TetrisModel_rows: "TetrisModel_rows",
  TetrisModel_cols: "TetrisModel_cols",
  TetrisModel_cells: "TetrisModel_cells",
  TetrisModel_activePiece: "TetrisModel_activePiece",
  TetrisModel_gameOn: "TetrisModel_gameOn",
  TetrisModel_gameEnded: "TetrisModel_gameEnded",
  TetrisModel_ticksPerMove: "TetrisModel_ticksPerMove",
  TetrisModel_tickCnt: "TetrisModel_tickCnt",
  TetrisModel_doesCollide: "TetrisModel_doesCollide",
  TetrisModel_tick: "TetrisModel_tick",
  TetrisModel_left: "TetrisModel_left",
  TetrisModel_right: "TetrisModel_right",
  TetrisModel_rotateCells: "TetrisModel_rotateCells",
  TetrisModel_rotate: "TetrisModel_rotate",
  TetrisModel_step: "TetrisModel_step",
  TetrisModel_pickNextColor: "TetrisModel_pickNextColor",
  TetrisModel_addPiece: "TetrisModel_addPiece",
  TetrisModel_dropRows: "TetrisModel_dropRows",
  TetrisModel_resetGame: "TetrisModel_resetGame",
  TetrisModel_start: "TetrisModel_start"
};

export const TetrisModelReducer = (
  state: ITetrisModel = initTetrisModel(),
  action: any
) => {
  return immer.produce(state, draft => {
    switch (action.type) {
      case TetrisModelEnums.TetrisModel_useColors:
        new RTetrisModel(draft).useColors = action.payload;
        break;
      case TetrisModelEnums.TetrisModel_lastUsedColor:
        new RTetrisModel(draft).lastUsedColor = action.payload;
        break;
      case TetrisModelEnums.TetrisModel_points:
        new RTetrisModel(draft).points = action.payload;
        break;
      case TetrisModelEnums.TetrisModel_rows:
        new RTetrisModel(draft).rows = action.payload;
        break;
      case TetrisModelEnums.TetrisModel_cols:
        new RTetrisModel(draft).cols = action.payload;
        break;
      case TetrisModelEnums.TetrisModel_cells:
        new RTetrisModel(draft).cells = action.payload;
        break;
      case TetrisModelEnums.TetrisModel_activePiece:
        new RTetrisModel(draft).activePiece = action.payload;
        break;
      case TetrisModelEnums.TetrisModel_gameOn:
        new RTetrisModel(draft).gameOn = action.payload;
        break;
      case TetrisModelEnums.TetrisModel_gameEnded:
        new RTetrisModel(draft).gameEnded = action.payload;
        break;
      case TetrisModelEnums.TetrisModel_ticksPerMove:
        new RTetrisModel(draft).ticksPerMove = action.payload;
        break;
      case TetrisModelEnums.TetrisModel_tickCnt:
        new RTetrisModel(draft).tickCnt = action.payload;
        break;
      case TetrisModelEnums.TetrisModel_tick:
        new RTetrisModel(draft).tick();
        break;
      case TetrisModelEnums.TetrisModel_left:
        new RTetrisModel(draft).left();
        break;
      case TetrisModelEnums.TetrisModel_right:
        new RTetrisModel(draft).right();
        break;
      case TetrisModelEnums.TetrisModel_rotate:
        new RTetrisModel(draft).rotate();
        break;
      case TetrisModelEnums.TetrisModel_step:
        new RTetrisModel(draft).step();
        break;
      case TetrisModelEnums.TetrisModel_addPiece:
        new RTetrisModel(draft).addPiece();
        break;
      case TetrisModelEnums.TetrisModel_dropRows:
        new RTetrisModel(draft).dropRows();
        break;
      case TetrisModelEnums.TetrisModel_resetGame:
        new RTetrisModel(draft).resetGame();
        break;
      case TetrisModelEnums.TetrisModel_start:
        new RTetrisModel(draft).start();
        break;
    }
  });
};
/***************************
 * React Context API test   *
 ***************************/
export const TetrisModelContext = React.createContext<IProps>(
  initWithMethodsTetrisModel()
);
export const TetrisModelConsumer = TetrisModelContext.Consumer;
let instanceCnt = 1;
export class TetrisModelProvider extends React.Component {
  public state: ITetrisModel = initTetrisModel();
  public lastSetState: ITetrisModel;
  private __devTools: any = null;
  constructor(props: any) {
    super(props);
    this.lastSetState = this.state;
    this.tick = this.tick.bind(this);
    this.left = this.left.bind(this);
    this.right = this.right.bind(this);
    this.rotate = this.rotate.bind(this);
    this.step = this.step.bind(this);
    this.addPiece = this.addPiece.bind(this);
    this.dropRows = this.dropRows.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.start = this.start.bind(this);
    const devs = window["devToolsExtension"]
      ? window["devToolsExtension"]
      : null;
    if (devs) {
      this.__devTools = devs.connect({ name: "TetrisModel" + instanceCnt++ });
      this.__devTools.init(this.state);
      this.__devTools.subscribe((msg: any) => {
        if (msg.type === "DISPATCH" && msg.state) {
          this.setState(JSON.parse(msg.state));
        }
      });
    }
  }
  public componentWillUnmount() {
    if (this.__devTools) {
      this.__devTools.unsubscribe();
    }
  }
  public setStateSync(state: ITetrisModel) {
    this.lastSetState = state;
    this.setState(state);
  }
  tick() {
    const nextState = immer.produce(this.state, draft =>
      new RTetrisModel(draft).tick()
    );
    if (this.__devTools) {
      this.__devTools.send("tick", nextState);
    }
    this.setStateSync(nextState);
  }
  left() {
    const nextState = immer.produce(this.state, draft =>
      new RTetrisModel(draft).left()
    );
    if (this.__devTools) {
      this.__devTools.send("left", nextState);
    }
    this.setStateSync(nextState);
  }
  right() {
    const nextState = immer.produce(this.state, draft =>
      new RTetrisModel(draft).right()
    );
    if (this.__devTools) {
      this.__devTools.send("right", nextState);
    }
    this.setStateSync(nextState);
  }
  rotate() {
    const nextState = immer.produce(this.state, draft =>
      new RTetrisModel(draft).rotate()
    );
    if (this.__devTools) {
      this.__devTools.send("rotate", nextState);
    }
    this.setStateSync(nextState);
  }
  step() {
    const nextState = immer.produce(this.state, draft =>
      new RTetrisModel(draft).step()
    );
    if (this.__devTools) {
      this.__devTools.send("step", nextState);
    }
    this.setStateSync(nextState);
  }
  addPiece() {
    const nextState = immer.produce(this.state, draft =>
      new RTetrisModel(draft).addPiece()
    );
    if (this.__devTools) {
      this.__devTools.send("addPiece", nextState);
    }
    this.setStateSync(nextState);
  }
  dropRows() {
    const nextState = immer.produce(this.state, draft =>
      new RTetrisModel(draft).dropRows()
    );
    if (this.__devTools) {
      this.__devTools.send("dropRows", nextState);
    }
    this.setStateSync(nextState);
  }
  resetGame() {
    const nextState = immer.produce(this.state, draft =>
      new RTetrisModel(draft).resetGame()
    );
    if (this.__devTools) {
      this.__devTools.send("resetGame", nextState);
    }
    this.setStateSync(nextState);
  }
  start() {
    const nextState = immer.produce(this.state, draft =>
      new RTetrisModel(draft).start()
    );
    if (this.__devTools) {
      this.__devTools.send("start", nextState);
    }
    this.setStateSync(nextState);
  }
  public render() {
    return (
      <TetrisModelContext.Provider
        value={{
          ...this.state,
          tick: this.tick,
          left: this.left,
          right: this.right,
          rotate: this.rotate,
          step: this.step,
          addPiece: this.addPiece,
          dropRows: this.dropRows,
          resetGame: this.resetGame,
          start: this.start
        }}
      >
        {" "}
        {this.props.children}
      </TetrisModelContext.Provider>
    );
  }
}
