import { Shape } from 'two.js/src/shape'
import Canvas from './Canvas'
import { Character, Line } from './shapes'
import { Direction, Axis } from './shapes/Line'
import { CellBorder, Charset } from './types'

const DEFAULT_CHARSET: Charset = {
  [CellBorder.Empty]: ' ',
  [CellBorder.Horizontal]: '─',
  [CellBorder.Vertical]: '│',
  [CellBorder.DownRight]: '┌',
  [CellBorder.DownLeft]: '┐',
  [CellBorder.UpRight]: '└',
  [CellBorder.UpLeft]: '┘',
  [CellBorder.VerticalRight]: '├',
  [CellBorder.VerticalLeft]: '┤',
  [CellBorder.HorizontalDown]: '┬',
  [CellBorder.HorizontalUp]: '┴',
  [CellBorder.VerticalHorizontal]: '┼',
}

export class Cell {
  readonly row: number
  readonly col: number
  border: CellBorder
  state: Direction
  character?: string

  constructor(row: number, col: number) {
    this.row = row
    this.col = col
    this.border = CellBorder.Empty
    this.state = Direction.None
  }

  update(type: CellBorder.Vertical | CellBorder.Horizontal, anchor: Direction) {
    this.setBorder(type, anchor)
    if (anchor != Direction.None && this.state == Direction.None) {
      this.state = anchor
    }
  }

  setChar(char: string) {
    this.character = char
  }

  setBorder(
    type: CellBorder.Vertical | CellBorder.Horizontal,
    anchor: Direction
  ) {
    if (this.border == CellBorder.Empty || this.border == type) {
      this.border = type
      return
    }

    if (type == CellBorder.Vertical) {
      if (
        this.border == CellBorder.DownLeft ||
        this.border == CellBorder.UpLeft
      ) {
        this.border = CellBorder.VerticalLeft
      }

      if (
        this.border == CellBorder.DownRight ||
        this.border == CellBorder.UpRight
      ) {
        this.border = CellBorder.VerticalRight
        return
      }

      if (
        this.border == CellBorder.HorizontalUp &&
        anchor == Direction.VERTICAL_DOWN
      ) {
        this.border = CellBorder.VerticalHorizontal
        return
      }

      if (
        this.border == CellBorder.HorizontalDown &&
        anchor == Direction.VERTICAL_UP
      ) {
        this.border = CellBorder.VerticalHorizontal
        return
      }

      if (this.border == CellBorder.Horizontal) {
        if (this.state == Direction.None) {
          if (anchor == Direction.None) {
            this.border = CellBorder.VerticalHorizontal
            return
          } else if (anchor == Direction.VERTICAL_UP) {
            this.border = CellBorder.HorizontalUp
            return
          } else if (anchor == Direction.VERTICAL_DOWN) {
            this.border = CellBorder.HorizontalDown
            return
          }
        }

        if (this.state == Direction.HORIZONTAL_LEFT) {
          if (anchor == Direction.None) {
            this.border = CellBorder.VerticalLeft
            return
          }

          if (anchor == Direction.VERTICAL_UP) {
            this.border = CellBorder.UpLeft
            return
          }

          if (anchor == Direction.VERTICAL_DOWN) {
            this.border = CellBorder.DownLeft
            return
          }
        }

        if (this.state == Direction.HORIZONTAL_RIGHT) {
          if (anchor == Direction.None) {
            this.border = CellBorder.VerticalRight
            return
          }

          if (anchor == Direction.VERTICAL_UP) {
            this.border = CellBorder.UpRight
            return
          }

          if (anchor == Direction.VERTICAL_DOWN) {
            this.border = CellBorder.DownRight
            return
          }
        }
      }
    }

    if (type == CellBorder.Horizontal) {
      if (
        this.border == CellBorder.DownLeft ||
        this.border == CellBorder.DownRight
      ) {
        this.border = CellBorder.HorizontalDown
        return
      }

      if (
        this.border == CellBorder.UpLeft ||
        this.border == CellBorder.UpRight
      ) {
        this.border = CellBorder.HorizontalUp
        return
      }

      if (
        this.border == CellBorder.VerticalLeft &&
        anchor == Direction.HORIZONTAL_RIGHT
      ) {
        this.border = CellBorder.VerticalHorizontal
      }

      if (
        this.border == CellBorder.VerticalRight &&
        anchor == Direction.HORIZONTAL_LEFT
      ) {
        this.border = CellBorder.VerticalHorizontal
      }

      if (this.border == CellBorder.Vertical) {
        if (this.state == Direction.None) {
          if (anchor == Direction.None) {
            this.border = CellBorder.VerticalHorizontal
            return
          }

          if (anchor == Direction.HORIZONTAL_LEFT) {
            this.border = CellBorder.VerticalLeft
            return
          }

          if (anchor == Direction.HORIZONTAL_RIGHT) {
            this.border = CellBorder.VerticalRight
            return
          }
        }

        if (this.state == Direction.VERTICAL_UP) {
          if (anchor == Direction.None) {
            this.border = CellBorder.HorizontalUp
            return
          }

          if (anchor == Direction.HORIZONTAL_LEFT) {
            this.border = CellBorder.UpLeft
            return
          }

          if (anchor == Direction.HORIZONTAL_RIGHT) {
            this.border = CellBorder.UpRight
            return
          }
        }

        if (this.state == Direction.VERTICAL_DOWN) {
          if (anchor == Direction.None) {
            this.border = CellBorder.HorizontalDown
            return
          }

          if (anchor == Direction.HORIZONTAL_LEFT) {
            this.border = CellBorder.DownLeft
            return
          }

          if (anchor == Direction.HORIZONTAL_RIGHT) {
            this.border = CellBorder.DownRight
            return
          }
        }
      }
    }
  }
}

export default class CellManager {
  private canvas: Canvas

  private lines: Line[] = []

  private chars: Character[] = []

  private _cells: { [key: string]: Shape[] } = {}

  private minCol: number = Number.MAX_VALUE
  private minRow: number = Number.MAX_VALUE
  private maxCol: number = Number.MIN_VALUE
  private maxRow: number = Number.MIN_VALUE

  constructor(canvas: Canvas) {
    this.canvas = canvas
  }

  getShape = (row: number, col: number): Shape | undefined => {
    console.log(this._cells)
    let cell = this._cells[`${row}_${col}`]
    // FIXME character first, then last shape
    return cell ? cell[cell.length - 1] : undefined
  }

  addLines(line: Line | Line[]) {
    const lines: Line[] = !Array.isArray(line) ? [line] : line
    for (let i = 0; i < lines.length; i++) {
      let { row: br, col: bc } = lines[i].begin
      let { row: er, col: ec } = lines[i].end
      this.minCol = Math.min(this.minCol, bc, ec)
      this.minRow = Math.min(this.minRow, br, er)
      this.maxCol = Math.max(this.maxCol, bc, ec)
      this.maxRow = Math.max(this.maxRow, br, er)

      let info = lines[i].axesInfo
      for (let j = info.pos[1]; j <= info.pos[2]; j++) {
        let key =
          info.axes[0] == Axis.HORIZONTAL
            ? `${info.pos[0]}_${j}`
            : `${j}_${info.pos[0]}`
        this._cells[key] = this._cells[key] ?? []
        this._cells[key].push(lines[i])
      }
      this.lines.push(lines[i])
    }
  }

  addCharacter(char: Character) {
    let { row: br, col: bc } = char.cell
    let key = `${br}_${bc}`
    this.minCol = Math.min(this.minCol, bc)
    this.minRow = Math.min(this.minRow, br)
    this.maxCol = Math.max(this.maxCol, bc)
    this.maxRow = Math.max(this.maxRow, br)
    this._cells[key] = this._cells[key] ?? []
    this._cells[key].push(char)
    this.chars.push(char)
  }

  remove(obj: Character) {
    let index = this.chars.findIndex((ch) => ch.id == obj.id)
    if (index >= 0) {
      this.chars.splice(index, 1)
    }
  }

  dumpText(charset: Charset = DEFAULT_CHARSET): any {
    let map: Cell[][] = []

    let row = this.maxRow - this.minRow + 1
    let col = this.maxCol - this.minCol + 1
    for (let i = 0; i < row; i++) {
      let row: Cell[] = []
      for (let j = 0; j < col; j++) {
        let cell = new Cell(i, j)
        row.push(cell)
      }
      map.push(row)
    }

    // remapping
    for (let i = 0; i < this.lines.length; i++) {
      let obj = this.lines[i]
      let br = obj.begin.row - this.minRow
      let bc = obj.begin.col - this.minCol
      let er = obj.end.row - this.minRow
      let ec = obj.end.col - this.minCol

      // FIXME: we can make all the paths left to right, up to down by creating them in the convention of end > begin
      if (obj._direction == Direction.HORIZONTAL_LEFT) {
        CellManager.fillToLeft(map, br, bc, ec)
      }

      if (obj._direction == Direction.HORIZONTAL_RIGHT) {
        CellManager.fillToRight(map, br, bc, ec)
      }

      if (obj._direction == Direction.VERTICAL_UP) {
        CellManager.fillToUp(map, bc, br, er)
      }

      if (obj._direction == Direction.VERTICAL_DOWN) {
        CellManager.fillToDown(map, bc, br, er)
      }
    }

    for (let i = 0; i < this.chars.length; i++) {
      let { row, col } = this.chars[i].cell
      CellManager.fillChar(
        map,
        row - this.minRow,
        col - this.minCol,
        this.chars[i].value
      )
    }

    return {
      row,
      col,
      content: map
        .map((line) =>
          line
            .map((c) => (c.character ? c.character : charset[c.border]))
            .join('')
        )
        .join('\n'),
    }
  }

  static fillChar(map: Cell[][], row: number, col: number, char: string) {
    map[row][col].setChar(char)
  }

  static fillToLeft(map: Cell[][], row: number, bc: number, ec: number) {
    for (let i = bc; i >= ec; i--) {
      let d = Direction.None

      if (i == bc) {
        d = Direction.HORIZONTAL_LEFT
      }
      if (i == ec) {
        d = Direction.HORIZONTAL_RIGHT
      }

      map[row][i].update(CellBorder.Horizontal, d)
    }
  }
  static fillToRight(map: Cell[][], row: number, bc: number, ec: number) {
    for (let i = bc; i <= ec; i++) {
      let d = Direction.None

      if (i == bc) {
        d = Direction.HORIZONTAL_RIGHT
      }
      if (i == ec) {
        d = Direction.HORIZONTAL_LEFT
      }
      map[row][i].update(CellBorder.Horizontal, d)
    }
  }

  // Horizontal, // '−',   ┌─
  // Vertical, // '│',     │a
  // DownRight, // '┌',
  static fillToUp(map: Cell[][], col: number, br: number, er: number) {
    for (let i = br; i >= er; i--) {
      let d = Direction.None

      if (i == br) {
        d = Direction.VERTICAL_UP
      }
      if (i == er) {
        d = Direction.VERTICAL_DOWN
      }

      map[i][col].update(CellBorder.Vertical, d)
    }
  }

  static fillToDown(map: Cell[][], col: number, br: number, er: number) {
    for (let i = br; i <= er; i++) {
      let d = Direction.None

      if (i == br) {
        d = Direction.VERTICAL_DOWN
      }
      if (i == er) {
        d = Direction.VERTICAL_UP
      }
      map[i][col].update(CellBorder.Vertical, d)
    }
  }
}
