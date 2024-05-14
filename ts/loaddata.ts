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

async function wdload_content() {
    let caves: JSONFormat_Content = await (() => {
        return new Promise((resolve) => {
            fetch("https://raw.githubusercontent.com/Wynntils/Static-Storage/main/Data-Storage/raw/content/content_book_dump.json")
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => {throw err});
        })
    })();
    return caves;
}

async function wdload_content_local() {
    let caves: JSONFormat_Content = await (() => {
        return new Promise((resolve) => {
            fetch("https://raw.githubusercontent.com/wynndex/wynndex/api/content_book.json")
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => {throw err});
        })
    })();
    return caves;
}

function build_poi(
    item: JSONFormat_ContentItem,
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