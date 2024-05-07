type MouseStateType = {
    pressed: boolean,
    pressed_x: number,
    pressed_y: number,
    x: number,
    y: number;
}

type TransformStateType = {
    x: number;
    y: number;
    buffered_x: number;
    buffered_y: number;
    scale: number,
}

/* JSON Formatting */
type JSONFormat_WynntilsMap = {
    md5: string,
    name: string,
    url: string,
    x1: number,
    x2: number,
    z1: number,
    z2: number;
}

type JSONFormat_WynntilsCave = {
    "type": string,
    "name": string,
    "specialInfo": string,
    "description": string,
    "length": string,
    "lengthInfo": string,
    "difficulty": string,
    "requirements": number,
    "rewards": string[],
    "location": {
      "x": number,
      "y": number,
      "z": number
    }
  }