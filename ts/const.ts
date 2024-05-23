const url = {
    wynntils: {
        map_json: "https://raw.githubusercontent.com/Wynntils/WynntilsWebsite-API/master/maps/maps.json",
        content_book_json: "https://raw.githubusercontent.com/Wynntils/Static-Storage/main/Data-Storage/raw/content/content_book_dump.json"
    },
    wynndex: {
        content_book_json: "https://wynndex.github.io/api/content_book.json"
    },
    texture: {
        frame_active: {
            quest: "rsc/frame_quest_a.png",
            storylineQuest: "rsc/frame_story_a.png",
            miniQuest: "rsc/frame_miniquest_a.png",
            cave: "rsc/frame_cave_a.png",
            dungeon: "rsc/frame_dungeon_a.png",
            bossAltar: "rsc/frame_boss_a.png",
            lootrunCamp: "rsc/frame_lootrun_a.png",
            raid: "rsc/frame_raid_a.png",
            secretDiscovery: "rsc/frame_discovery_a.png",
            worldDiscovery: "rsc/frame_discovery_a.png",
            territorialDiscovery: "rsc/frame_discovery_a.png"
        },
        frame_inactive: {
            quest: "rsc/frame_quest.png",
            storylineQuest: "rsc/frame_story.png",
            miniQuest: "rsc/frame_miniquest.png",
            cave: "rsc/frame_cave.png",
            dungeon: "rsc/frame_dungeon.png",
            bossAltar: "rsc/frame_boss.png",
            lootrunCamp: "rsc/frame_lootrun.png",
            raid: "rsc/frame_raid.png",
            secretDiscovery: "rsc/frame_discovery.png",
            worldDiscovery: "rsc/frame_discovery.png",
            territorialDiscovery: "rsc/frame_discovery.png"
        },
        empty: "rsc/empty.png"
    }
}

const options = {
    view: {
        quest: true,
        miniQuest: true,
        cave: true,
        dungeon: true,
        bossAltar: true,
        lootrunCamp: true,
        raid: true,
        secretDiscovery: false,
        worldDiscovery: false,
        territorialDiscovery: false
    },
    filter: ""
}

const texture = {
    frame_active: {
        quest: null,
        storylineQuest: null,
        miniQuest: null,
        cave: null,
        dungeon: null,
        bossAltar: null,
        lootrunCamp: null,
        raid: null,
        secretDiscovery: null,
        worldDiscovery: null,
        territorialDiscovery: null
    },
    frame_inactive: {
        quest: null,
        storylineQuest: null,
        miniQuest: null,
        cave: null,
        dungeon: null,
        bossAltar: null,
        lootrunCamp: null,
        raid: null,
        secretDiscovery: null,
        worldDiscovery: null,
        territorialDiscovery: null
    },
    empty: null
}

let canvas: AutoCanvas;
let content: Dict<JSON_Content_Item>;