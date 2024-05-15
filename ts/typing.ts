type Dict<T> = {[id: string]: T}

/* Internal */
type JSON_Content_Item = {
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
};

/** 
 * Wynntils
 */
type JSON_Wynntils_Map = {
    md5: string,
    name: string,
    url: string,
    x1: number,
    x2: number,
    z1: number,
    z2: number;
}

type JSON_Wynntils_Content_Book = {
    "quest": JSON_Content_Item[],
    "miniQuest": JSON_Content_Item[],
    "cave": JSON_Content_Item[],
    "secretDiscovery": JSON_Content_Item[],
    "worldDiscovery": JSON_Content_Item[],
    "territorialDiscovery": JSON_Content_Item[],
    "dungeon": JSON_Content_Item[],
    "raid": JSON_Content_Item[],
    "bossAltar": JSON_Content_Item[],
    "lootrunCamp": JSON_Content_Item[]
};