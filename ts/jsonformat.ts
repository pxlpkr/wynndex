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