async function wdload_quests() {
    let quests: string[] = await (() => {
        return new Promise((resolve) => {
            fetch("wynn/quests/dir.json")
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => {throw err});
        })
    })();
    return quests;
}

async function wdload_caves() {
    let caves: JSONFormat_WynntilsCave[] = await (() => {
        return new Promise((resolve) => {
            fetch("https://raw.githubusercontent.com/Wynntils/Reference/main/content/cave.json")
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => {throw err});
        })
    })();
    return caves;
}