const options = {
    "view": {
        "quest": true,
        "miniQuest": true,
        "cave": true,
        "secretDiscovery": false,
        "worldDiscovery": false,
        "territorialDiscovery": false,
        "dungeon": true,
        "raid": true,
        "bossAltar": true,
        "lootrunCamp": true
    },
    "filter": ""
}

const texture: Dict<HTMLImageElement> = {
    frame_boss_a: null,
    frame_cave_a: null,
    frame_discovery_a: null,
    frame_dungeon_a: null,
    frame_lootrun_a: null,
    frame_miniquest_a: null,
    frame_quest_a: null,
    frame_raid_a: null,
    frame_story_a: null,
    empty: null
}

let canvas: AutoCanvas;
let content: Dict<JSON_Content_Item>;

const match_type_frame_a: (type: string) => HTMLImageElement = (type: string) => {
    switch (type) {
        case "quest":                   return texture.frame_quest_a;
        case "storylineQuest":          return texture.frame_story_a;
        case "miniQuest":               return texture.frame_miniquest_a;
        case "cave":                    return texture.frame_cave_a;
        case "dungeon":                 return texture.frame_dungeon_a;
        case "bossAltar":               return texture.frame_boss_a;
        case "lootrunCamp":             return texture.frame_lootrun_a;
        case "raid":                    return texture.frame_raid_a;
        case "secretDiscovery":         return texture.frame_discovery_a;
        case "worldDiscovery":          return texture.frame_discovery_a;
        case "territorialDiscovery":    return texture.frame_discovery_a;
        default:                        return texture.empty;
    }
}

const match_type_frame_a_url: (type: string) => string = (type: string) => {
    switch (type) {
        case "quest":                   return "rsc/frame_quest_a.png";
        case "storylineQuest":          return "rsc/frame_story_a.png";
        case "miniQuest":               return "rsc/frame_miniquest_a.png";
        case "cave":                    return "rsc/frame_cave_a.png";
        case "dungeon":                 return "rsc/frame_dungeon_a.png";
        case "bossAltar":               return "rsc/frame_boss_a.png";
        case "lootrunCamp":             return "rsc/frame_lootrun_a.png";
        case "raid":                    return "rsc/frame_raid_a.png";
        case "secretDiscovery":         return "rsc/frame_discovery_a.png";
        case "worldDiscovery":          return "rsc/frame_discovery_a.png";
        case "territorialDiscovery":    return "rsc/frame_discovery_a.png";
        default:                        return "rsc/empty.png";
    }
}

const match_type_frame_url: (type: string) => string = (type: string) => {
    switch (type) {
        case "quest":                   return "rsc/frame_quest.png";
        case "storylineQuest":          return "rsc/frame_story.png";
        case "miniQuest":               return "rsc/frame_miniquest.png";
        case "cave":                    return "rsc/frame_cave.png";
        case "dungeon":                 return "rsc/frame_dungeon.png";
        case "bossAltar":               return "rsc/frame_boss.png";
        case "lootrunCamp":             return "rsc/frame_lootrun.png";
        case "raid":                    return "rsc/frame_raid.png";
        case "secretDiscovery":         return "rsc/frame_discovery.png";
        case "worldDiscovery":          return "rsc/frame_discovery.png";
        case "territorialDiscovery":    return "rsc/frame_discovery.png";
        default:                        return "rsc/empty.png";
    }
}