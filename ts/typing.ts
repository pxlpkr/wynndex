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

type JSONFormat_ContentItem = {
    "type": string,
    "name": string,
    "specialInfo": string,
    "description": string,
    "length": string,
    "lengthInfo": string,
    "difficulty": string,
    "requirements": {
      "level": number,
      "professionLevels": {},
      "quests": string[]
    },
    "rewards": string[],
    "location": {
        "x": number,
        "y": number,
        "z": number
    } | null
}

type JSONFormat_Content = {
    "quest": JSONFormat_ContentItem[],
    "miniQuest": JSONFormat_ContentItem[],
    "cave": JSONFormat_ContentItem[],
    "secretDiscovery": JSONFormat_ContentItem[],
    "worldDiscovery": JSONFormat_ContentItem[],
    "territorialDiscovery": JSONFormat_ContentItem[],
    "dungeon": JSONFormat_ContentItem[],
    "raid": JSONFormat_ContentItem[],
    "bossAltar": JSONFormat_ContentItem[],
    "lootrunCamp": JSONFormat_ContentItem[]
}