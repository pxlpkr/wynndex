const WYNNTILS_API_CONTENT_BOOK = "https://raw.githubusercontent.com/Wynntils/Static-Storage/main/Data-Storage/raw/content/content_book_dump.json";
const WYNNDEX_API_CONTENT_BOOK = "https://wynndex.github.io/api/content_book.json";

/**
 * Converts a JSON_Wynntils_Content_Book object obtained from Wynntils into
 * a list of internal JSON_Content_Item(s)
 * 
 * @param   content JSON_Wynntils_Content_Book-encoded data
 * @returns         JSON_Content_Item[]-encoded data
 */
function flatten_content(content: JSON_Wynntils_Content_Book): JSON_Content_Item[] {
    return [].concat(
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
async function wdload_content(): Promise<Dict<JSON_Content_Item>> {
    // Get Wynntils data
    let content: JSON_Wynntils_Content_Book = await (() => {
        return new Promise((resolve) => {
            fetch(WYNNTILS_API_CONTENT_BOOK)
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => {throw err});
        })
    })();

    // Get Wynndex patches
    let content_patch: JSON_Content_Item[] = await (() => {
        return new Promise((resolve) => {
            fetch(WYNNDEX_API_CONTENT_BOOK)
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

            if ([null, undefined, ""].includes(data[`${item.type}_${item.name}`][key]) || data[`${item.type}_${item.name}`][key].length == 0) {
                data[`${item.type}_${item.name}`][key] = value;
            }
        }
    }

    // Remove color codes from descriptions
    for (const item of Object.values(data)) {
        let color_format_index: number;
        while ((color_format_index = item.description.indexOf('\u00a7')) != -1) {
            item.description = item.description.slice(0, color_format_index) + item.description.slice(color_format_index + 2)
        }
    }

    return data;
}

function build_poi(
    item: JSON_Content_Item,
    image: HTMLImageElement,
    generator: (ui: UIPanel, opts: {[key: string]: any}) => void,
    canvas: AutoCanvas
) {
    return wrap(new ACC_Image(canvas, item.location.x, item.location.z))
            .set('img', image)
            .set('render_ignore_scaling', true)
            .set('render_centered', true)
            .set('render_base_scale', 2)
            .set('on_hover', (c: ACC_Image) => {
                c.render_base_scale.addTask(new ACC_Task(0.2, 100, ACC_EaseType.LINEAR));
            })
            .set('on_hover_stop', (c: ACC_Image) => {
                c.render_base_scale.addTask(new ACC_Task(-0.2, 100, ACC_EaseType.LINEAR));
            })
            .set('on_press', (c: ACC_Image) => {
                c.render_base_scale.addTask(new ACC_Task(-0.2, 40, ACC_EaseType.LINEAR));
            })
            .set('on_release', (c: ACC_Image) => {
                c.render_base_scale.addTask(new ACC_Task(0.2, 40, ACC_EaseType.LINEAR));
            })
            .set('on_click', (c: ACC_Image) => {
                let ui_id = `${item.type}_${item.name}`;
                if (UIPanel.tryFetch(ui_id)) {
                    UIPanel.tryFetch(ui_id).dispose();
                } else {
                    new UIPanel({
                        include_close: false,
                        include_navigation: true,
                        allow_dragging: false,
                        unique_id: ui_id,
                        generator: {
                            'type': item.type,
                            'generator': generator,
                            'data': item
                        },
                        at: [c.get_render_x(canvas.transform) + c.get_render_width(canvas.transform) + 2,
                            c.get_render_y(canvas.transform)]
                    });
                }
            })
            .unwrap();
}