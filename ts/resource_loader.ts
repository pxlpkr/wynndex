class ProgressReporter {
    progress: number;
    working_maximum: number;
    progress_element: HTMLDivElement;
    progress_status: HTMLDivElement;
    default_value: number;

    constructor(initial: number) {
        this.progress = initial;
        this.progress_element = document.getElementById("loading-progress") as HTMLImageElement;
        this.progress_status = document.getElementById("loading-status") as HTMLImageElement;
        this.working_maximum = 100;
        this.default_value = 10;
    }

    public set_weight(value: number): void {
        this.working_maximum = value;
    }

    public report(value?: number, message?: string): void {
        if (value == undefined) {
            value = this.default_value;
        }
        this.report_raw(this.progress + value * this.working_maximum / 100, message);
    }

    private report_raw(value: number, message?: string): void {
        this.progress = value;
        this.progress_element.style.width = `${Math.round(this.progress)}%`;
        if (message != undefined) {
            this.progress_status.innerText = message;
        }
    }

    public set_default(value: number): void {
        this.default_value = value;
    }

    public complete(message?: string) {
        this.report_raw(100, message);
    }
}

function travelPath(base: object, path: string[]): object {
    for (const item of path) {
        base = base[item];
    }
    return base;
}

/**
 * Fetches all textures located in [url.texture] and saves HTMLImageElement(s)
 * to [texture]
 * Exits once all images are fully loaded
 */
async function fetch_textures(reporter: ProgressReporter) {
    const promises: ((resolve: any) => void)[] = [];

    // Begin loading of textures
    const inner_1 = (path: string[] = []) => {
        const target = travelPath(url.texture, path);
        const texture_target = travelPath(texture, path);

        for (const [id, obj] of Object.entries(target)) {
            if (typeof obj == "object") {
                inner_1([...path, id]);
                continue;
            }
            let texture = wrap(new Image()).set("src", obj).unwrap();
            promises.push((resolve) => {
                texture.addEventListener("load", () => {
                    reporter.report(100 / promises.length, `Loaded ${obj}`);
                    resolve(null);
                });
            });
            texture_target[id] = texture;
        }
    };

    inner_1();

    await Promise.all(promises.map((x) => new Promise(x)));
}

async function fetch_map(): Promise<JSON_Wynntils_Map[]> {
    return await (() => {
        return new Promise((resolve) => {
            fetch(url.wynntils.map_json)
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => {throw err});
        })
    })();
}

/**
 * Converts a JSON_Wynntils_Content_Book object obtained from Wynntils into
 * a list of internal JSON_Content_Item(s)
 *
 * @param   content JSON_Wynntils_Content_Book-encoded data
 * @returns         JSON_Content_Item[]-encoded data
 */
function flatten_content(content: JSON_Wynntils_Content_Book): JSON_Content_Item[] {
    return [].concat(
        content.territorialDiscovery, content.worldDiscovery,
        content.secretDiscovery,
        content.cave, content.miniQuest, content.quest, content.bossAltar,
        content.dungeon, content.raid, content.lootrunCamp
    )
}

/**
 * Loads content from the Wynntils and Wynndex APIs, returning an object
 * where
 *
 * @returns         Dict containing content book items
 */
async function fetch_content(): Promise<Dict<JSON_Content_Item>> {
    // Get Wynntils data
    let content: JSON_Wynntils_Content_Book = await (() => {
        return new Promise((resolve) => {
            fetch(url.wynntils.content_book_json)
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => {throw err});
        })
    })();

    // Get Wynndex patches
    let content_patch: JSON_Content_Item[] = await (() => {
        return new Promise((resolve) => {
            fetch(url.wynndex.content_book_json)
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => {throw err});
        })
    })();

    // Convert data to dict
    let data: Dict<JSON_Content_Item> = {};
    for (const item of flatten_content(content)) {
        data[`${item.type}_${item.name}`] = item;
    }

    // Apply patches
    for (const item of content_patch) {
        for (const [key, value] of Object.entries(item)) {
            if (key == "name" || key == "type") {
                continue;
            }

            if (!Object.keys(data).includes(`${item.type}_${item.name}`)) {
                console.log(`Unknown patch for: ${item.type}_${item.name}`);
                continue;
            }
            data[`${item.type}_${item.name}`][key] = value;
        }
    }

    // Remove color codes from descriptions
    for (const item of Object.values(data)) {
        let color_format_index: number;
        while ((color_format_index = item.description.indexOf('\u00a7')) != -1) {
            item.description = item.description.slice(0, color_format_index) + item.description.slice(color_format_index + 2)
        }
        for (let i = 0; i < item.requirements.quests.length; i++) {
            while ((color_format_index = item.requirements.quests[i].indexOf('\u058E')) != -1) {
                item.requirements.quests[i] = item.requirements.quests[i].slice(0, color_format_index) + item.requirements.quests[i].slice(color_format_index + 2)
            }
        }
    }

    // Check location data
    for (const item of Object.values(data)) {
        if (item.location == null) {
            console.log(`No location for: ${item.type}_${item.name}`);
        }
    }

    return data;
}