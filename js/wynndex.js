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
};
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
};
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
};
let canvas;
let content;
const parse_rewards_requirements = (data) => {
    let o = fast("div");
    if (data.requirements.quests.length > 0 || Object.keys(data.requirements.professionLevels).length > 0) {
        let l = fast("label", { innerText: 'Requirements:', className: "ui-label broad-text small-text" });
        for (const quest of data.requirements.quests) {
            l.appendChild(fast("br"));
            l.appendChild(fast("img", { src: "rsc/frame_quest_a.png", className: "tiny-icon" }));
            l.innerHTML += quest;
        }
        for (const [prof, level] of Object.entries(data.requirements.professionLevels)) {
            l.appendChild(fast("br"));
            l.appendChild(fast("img", { src: `rsc/prof_${prof}.png`, className: "tiny-icon" }));
            l.innerHTML += `${prof.charAt(0).toUpperCase()}${prof.slice(1)} ${level}`;
        }
        o.appendChild(l);
    }
    if (data.rewards.length > 0) {
        let l = fast("label", { innerText: 'Rewards:', className: "ui-label broad-text small-text" });
        for (const reward of data.rewards) {
            l.appendChild(fast("br"));
            let s = reward.split(' ');
            if (s.length > 1 && ["Fishing", "Farming", "Woodcutting", "Mining"].includes(s[1])) {
                l.appendChild(fast("img", { src: `rsc/prof_${s[1].toLowerCase()}_xp.png`, className: "tiny-icon" }));
            }
            else if (s.length > 1 && s[1] == "XP" || s[1] == "Combat") {
                l.appendChild(fast("img", { src: `rsc/xp.png`, className: "tiny-icon" }));
            }
            else if (s.length > 1 && s[1] == "Emeralds") {
                let count = parseInt(s[0]);
                if (count < 64 * 8) {
                    l.appendChild(fast("img", { src: `rsc/emerald.png`, className: "tiny-icon" }));
                }
                else if (count < 64 * 64) {
                    l.appendChild(fast("img", { src: `rsc/emerald_block.png`, className: "tiny-icon" }));
                }
                else {
                    l.appendChild(fast("img", { src: `rsc/emerald_liquid.png`, className: "tiny-icon" }));
                }
            }
            else if (s.length > 0 && s[s.length - 1] == "Key") {
                l.appendChild(fast("img", { src: `rsc/key.png`, className: "tiny-icon" }));
            }
            else if (s.length > 0 && s[0] == "Access") {
                l.appendChild(fast("img", { src: `rsc/unlocked.png`, className: "tiny-icon" }));
            }
            else {
                l.appendChild(fast("img", { src: `rsc/empty.png`, className: "tiny-icon" }));
            }
            l.innerHTML += reward;
        }
        o.appendChild(l);
    }
    return o;
};
function closest_match(filter, ignore) {
    let max_score = -1;
    let best = null;
    for (const item of Object.values(content)) {
        if (ignore.includes(item) || !options.view[item.type != 'storylineQuest' ? item.type : 'quest']) {
            continue;
        }
        if (item.name.toLowerCase() == filter.toLowerCase()) {
            return item;
        }
        if (item.name.toLowerCase().startsWith(filter.toLowerCase()) && max_score < 5) {
            max_score = 5;
            best = item;
        }
        else if (item.name.toLowerCase().includes(filter.toLowerCase()) && max_score < 2) {
            max_score = 2;
            best = item;
        }
    }
    return best;
}
function update_search_results(search_bar, item_1, search_results, search_elements) {
    options.filter = search_bar.value;
    if (search_bar.value.length == 0) {
        item_1.removeChild(search_results);
    }
    else if (!item_1.contains(search_results)) {
        item_1.appendChild(search_results);
    }
    let matches = [];
    for (let i = 0; i < 3; i++) {
        matches.splice(0, 0, closest_match(search_bar.value, matches));
        if (matches[0] == null) {
            search_elements[i][0].src = url.texture.empty;
            search_elements[i][1].innerText = "";
            continue;
        }
        search_elements[i][0].src = url.texture.frame_active[matches[0].type] || url.texture.empty;
        search_elements[i][1].innerText = matches[0].name;
        search_elements[i][1].appendChild(fast("br"));
        search_elements[i][1].innerText += `Level ${matches[0].requirements.level}`;
    }
    Object.values(content);
}
const opt_filters = [
    ["Quests", "quest"],
    ["Mini Quests", "miniQuest"],
    ["Caves", "cave"],
    ["Dungeons", "dungeon"],
    ["Raids", "raid"],
    ["Lootruns", "lootrunCamp"],
    ["Boss Altars", "bossAltar"],
    ["World Discoveries", "worldDiscovery"],
    ["Territorial Discoveries", "territorialDiscovery"],
    ["Secret Discoveries", "secretDiscovery"]
];
const generate_ui_opt_filter = (ui, _) => {
    let item_1 = fast("div", { className: "ui-container ui-padded" });
    item_1.style.minWidth = `${256 + 64}px`;
    item_1.appendChild(fast("label", { innerText: "Filters", className: "ui-label center-text ui-title" }));
    let images = [];
    for (const item of opt_filters) {
        let outer = fast("div", { className: "ui-subdiv" });
        let img_button = fast("img", { draggable: "false", className: "filter-img" });
        if (options.view[item[1]]) {
            img_button.src = url.texture.frame_active[item[1]];
        }
        else {
            img_button.src = url.texture.frame_inactive[item[1]];
        }
        images.push(img_button);
        let img_label = fast("label", { innerText: item[0], className: "ui-label opt_item" });
        img_button.addEventListener("contextmenu", () => {
            for (const opt of Object.keys(options.view)) {
                options.view[opt] = false;
            }
            for (const [i, entry] of Object.entries(opt_filters)) {
                images[i].src = url.texture.frame_inactive[entry[1]];
            }
            img_button.src = url.texture.frame_active[item[1]];
            options.view[item[1]] = true;
        });
        img_button.addEventListener("click", () => {
            options.view[item[1]] = !options.view[item[1]];
            if (options.view[item[1]]) {
                img_button.src = url.texture.frame_active[item[1]];
            }
            else {
                img_button.src = url.texture.frame_inactive[item[1]];
            }
        });
        outer.appendChild(img_button);
        outer.appendChild(img_label);
        item_1.appendChild(outer);
    }
    item_1.appendChild(fast("hr", { className: "ui-separator" }));
    let search_elements = [[], [], []];
    let search_results = fast("div", { className: "ui-subdiv", style: "display: table" });
    for (let i = 0; i < 3; i++) {
        let inner = fast("div", { className: "ui-subdiv", style: "margin-top: 8px; display: flex" });
        search_elements[i].push(fast("img", { src: "rsc/empty.png", className: "filter-result-img" }));
        search_elements[i].push(fast("label", { className: "ui-label opt_item", style: "line-height: 80%; font-size: 22px !important" }));
        inner.appendChild(search_elements[i][0]);
        inner.appendChild(search_elements[i][1]);
        search_results.appendChild(inner);
    }
    let search_bar = fast("input", { type: "text", className: "filter-search-bar", placeholder: "Search", value: options.filter });
    search_bar.addEventListener("input", () => update_search_results(search_bar, item_1, search_results, search_elements));
    item_1.appendChild(search_bar);
    ui.getContent().appendChild(item_1);
};
const generate_ui_cave = (ui, data) => {
    let container = fast("div", { className: "ui-container ui-padded", children: [
            fast("label", { innerText: data.name, className: "ui-label center-text ui-title" }),
            fast("label", { innerText: `Level ${data.requirements.level} ${data.specialInfo ? data.specialInfo : data.type}`, className: "ui-label center-text broad-text ui-subtitle" }),
            fast("hr", { className: "ui-separator" }),
            fast("label", { innerText: `Length: ${data.length} (${data.lengthInfo})`, className: "ui-label small-text" }),
            fast("label", { innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text" }),
        ] });
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};
const generate_ui_bossaltar = (ui, data) => {
    let container = fast("div", { className: "ui-container ui-padded", children: [
            fast("label", { innerText: data.name, className: "ui-label center-text ui-title" }),
            fast("label", { innerText: `Level ${data.requirements.level} Boss Altar`, className: "ui-label center-text broad-text ui-subtitle" }),
            fast("hr", { className: "ui-separator" })
        ] });
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};
const generate_ui_quest = (ui, data) => {
    let container = fast("div", { className: "ui-container ui-padded", children: [
            fast("label", { innerText: data.name, className: "ui-label center-text ui-title" }),
            fast("label", { innerText: `Level ${data.requirements.level} ${data.type == 'storylineQuest' ? 'Storyline ' : ''}Quest${data.specialInfo != 'Storyline' ? '\n' + data.specialInfo : ''}`, className: "ui-label center-text broad-text ui-subtitle" }),
            fast("hr", { className: "ui-separator" }),
            fast("label", { innerText: `Length: ${data.length}`, className: "ui-label small-text" }),
            fast("label", { innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text" }),
        ] });
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};
const generate_ui_secret_discovery = (ui, data) => {
    let container = fast("div", { className: "ui-container ui-padded", children: [
            fast("label", { innerText: data.name, className: "ui-label center-text ui-title" }),
            fast("label", { innerText: `Level ${data.requirements.level} Secret Discovery`, className: "ui-label center-text broad-text ui-subtitle" }),
            fast("hr", { className: "ui-separator" }),
            fast("label", { innerText: `Region: ${data.specialInfo}`, className: "ui-label small-text" }),
        ] });
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};
const generate_ui_world_discovery = (ui, data) => {
    let container = fast("div", { className: "ui-container ui-padded", children: [
            fast("label", { innerText: data.name, className: "ui-label center-text ui-title" }),
            fast("label", { innerText: `Level ${data.requirements.level} World Discovery`, className: "ui-label center-text broad-text ui-subtitle" }),
            fast("hr", { className: "ui-separator" }),
        ] });
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};
const generate_ui_territorial_discovery = (ui, data) => {
    let container = fast("div", { className: "ui-container ui-padded", children: [
            fast("label", { innerText: data.name, className: "ui-label center-text ui-title" }),
            fast("label", { innerText: `Level ${data.requirements.level} Territory`, className: "ui-label center-text broad-text ui-subtitle" }),
            fast("hr", { className: "ui-separator" }),
        ] });
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};
const generate_ui_lootrun = (ui, data) => {
    let container = fast("div", { className: "ui-container ui-padded", children: [
            fast("label", { innerText: data.name, className: "ui-label center-text ui-title" }),
            fast("label", { innerText: `Level ${data.requirements.level} Lootrun Camp`, className: "ui-label center-text broad-text ui-subtitle" }),
            fast("hr", { className: "ui-separator" }),
            fast("label", { innerText: `Length: ${data.length}`, className: "ui-label small-text" }),
            fast("label", { innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text" }),
        ] });
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};
const generate_ui_raid = (ui, data) => {
    let container = fast("div", { className: "ui-container ui-padded", children: [
            fast("label", { innerText: data.name, className: "ui-label center-text ui-title" }),
            fast("label", { innerText: `Level ${data.requirements.level} Raid`, className: "ui-label center-text broad-text ui-subtitle" }),
            fast("hr", { className: "ui-separator" }),
            fast("label", { innerText: `Length: ${data.length}`, className: "ui-label small-text" }),
            fast("label", { innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text" }),
        ] });
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};
const generate_ui_miniquest = (ui, data) => {
    let container = fast("div", { className: "ui-container ui-padded", children: [
            fast("label", { innerText: data.name, className: "ui-label center-text ui-title" })
        ] });
    if (data.requirements.level != 0) {
        container.appendChild(fast("label", { innerText: `Level ${data.requirements.level} Combat Mini-Quest`, className: "ui-label center-text broad-text ui-subtitle" }));
    }
    else {
        let target = Object.entries(data.requirements.professionLevels)[0];
        container.appendChild(fast("label", { innerText: `Level ${target[1]} ${target[0]} Mini-Quest`, className: "ui-label center-text broad-text ui-subtitle" }));
    }
    container.appendChild(fast("hr", { className: "ui-separator" }));
    container.appendChild(fast("label", { innerText: `Length: ${data.length}`, className: "ui-label small-text" }));
    container.appendChild(fast("label", { innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text" }));
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};
const generate_ui_dungeon = (ui, data) => {
    let container = fast("div", { className: "ui-container ui-padded", children: [
            fast("label", { innerText: data.name, className: "ui-label center-text ui-title" }),
            fast("label", { innerText: `Level ${data.requirements.level} Dungeon`, className: "ui-label center-text broad-text ui-subtitle" }),
            fast("hr", { className: "ui-separator" }),
            fast("label", { innerText: `Length: ${data.length}`, className: "ui-label small-text" }),
            fast("label", { innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text" }),
        ] });
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};
document.addEventListener("contextmenu", (event) => {
    event.stopPropagation();
    event.preventDefault();
    return false;
});
document.addEventListener("DOMContentLoaded", async () => {
    canvas = new AutoCanvas();
    await fetch_textures();
    const map_json = await fetch_map();
    let map_fragments = [];
    for (const part of map_json) {
        if (part.name == "The Void") {
            part.x1 = 1600;
            part.z1 = -6000;
        }
        map_fragments.splice(0, 0, wrap(new Image())
            .set("src", part.url)
            .unwrap());
        let component = wrap(new ACC_Image(canvas, part.x1, part.z1))
            .set('img', map_fragments[0])
            .unwrap();
        canvas.addComponent(component);
    }
    for (const img of map_fragments) {
        if (!img.complete) {
            console.log(`site/loading_map Await map fragment ${img.src}`);
            await img.decode();
        }
    }
    content = await fetch_content();
    let opt_filter = wrap(new Image())
        .set("src", "rsc/opt_filter.png")
        .unwrap();
    let component = wrap(new ACC_Image(canvas, 4, canvas.canvas.height - 2))
        .set('render_ignore_scaling', true)
        .set('render_ignore_translation', true)
        .set('render_hoisted', true)
        .set('render_base_scale', 4)
        .set('img', opt_filter)
        .unwrap();
    component.y.set(() => canvas.canvas.height - 72);
    component.on_hover = (c) => c.y.addTask(new ACC_Task(-12, 150, ACC_EaseType.LINEAR));
    component.on_hover_stop = (c) => c.y.addTask(new ACC_Task(12, 150, ACC_EaseType.LINEAR));
    component.on_press = (c) => c.y.addTask(new ACC_Task(16, 100, ACC_EaseType.LINEAR));
    component.on_release = (c) => c.y.addTask(new ACC_Task(-16, 100, ACC_EaseType.LINEAR));
    component.on_click = (_) => {
        let ui_id = 'opt_filter';
        if (UIPanel.tryFetch('opt_filter')) {
            UIPanel.tryFetch(ui_id).dispose();
        }
        else {
            new UIPanel({
                include_close: true,
                include_navigation: false,
                allow_dragging: false,
                keep_visible: false,
                unique_id: ui_id,
                generator: {
                    'type': 'opt_filter',
                    'generator': generate_ui_opt_filter,
                    'data': null
                },
                at: [0, 0]
            });
        }
    };
    canvas.addComponent(component);
    for (const [_, item] of Object.entries(content)) {
        if (!item.location) {
            continue;
        }
        let component = wrap(new ACC_Image(canvas, item.location.x, item.location.z))
            .set('img', texture.frame_active[item.type])
            .set('render_ignore_scaling', true)
            .set('render_centered', true)
            .set('render_base_scale', 2)
            .set('verify', () => {
            if (item.type == "storylineQuest") {
                if (!options.view["quest"]) {
                    return false;
                }
            }
            else if (!options.view[item.type]) {
                return false;
            }
            if (options.filter.length > 0) {
                if (!item.name.toLowerCase().includes(options.filter.toLowerCase())) {
                    return false;
                }
            }
            return true;
        })
            .set('on_hover', (c) => {
            c.render_base_scale.addTask(new ACC_Task(0.2, 100, ACC_EaseType.LINEAR));
        })
            .set('on_hover_stop', (c) => {
            c.render_base_scale.addTask(new ACC_Task(-0.2, 100, ACC_EaseType.LINEAR));
        })
            .set('on_press', (c) => {
            c.render_base_scale.addTask(new ACC_Task(-0.2, 40, ACC_EaseType.LINEAR));
        })
            .set('on_release', (c) => {
            c.render_base_scale.addTask(new ACC_Task(0.2, 40, ACC_EaseType.LINEAR));
        })
            .set('on_click', (c) => {
            let ui_id = `${item.type}_${item.name}`;
            if (UIPanel.tryFetch(ui_id)) {
                UIPanel.tryFetch(ui_id).dispose();
            }
            else {
                let panelComponent = new ACC_Foreign(canvas, c.x.get(), c.y.get());
                panelComponent.static_offset_x = c.get_render_width(canvas.transform) / 2 + 8;
                panelComponent.static_offset_y = -c.get_render_width(canvas.transform) / 2;
                panelComponent.obj = new UIPanel({
                    include_close: true,
                    include_navigation: true,
                    allow_dragging: false,
                    keep_visible: false,
                    unique_id: ui_id,
                    generator: {
                        'type': item.type,
                        'generator': (() => {
                            switch (item.type) {
                                case "quest": return generate_ui_quest;
                                case "storylineQuest": return generate_ui_quest;
                                case "miniQuest": return generate_ui_miniquest;
                                case "cave": return generate_ui_cave;
                                case "dungeon": return generate_ui_dungeon;
                                case "bossAltar": return generate_ui_bossaltar;
                                case "lootrunCamp": return generate_ui_lootrun;
                                case "raid": return generate_ui_raid;
                                case "secretDiscovery": return generate_ui_secret_discovery;
                                case "worldDiscovery": return generate_ui_world_discovery;
                                case "territorialDiscovery": return generate_ui_territorial_discovery;
                            }
                        })(),
                        'data': item
                    },
                    at: [-1000, -1000]
                });
                panelComponent.refresh = ((ctx, transform) => {
                    if (panelComponent.obj.panel.classList.contains('is-fading-out')) {
                        canvas.removeComponent(panelComponent);
                    }
                    let x = `${panelComponent.get_render_x(transform).toFixed(0)}px`;
                    let y = `${panelComponent.get_render_y(transform).toFixed(0)}px`;
                    if (x != panelComponent.obj.panel.style.left) {
                        panelComponent.obj.panel.style.left = x;
                    }
                    if (y != panelComponent.obj.panel.style.top) {
                        panelComponent.obj.panel.style.top = y;
                    }
                    panelComponent.obj.updateContentSize();
                });
                canvas.addComponent(panelComponent);
            }
        })
            .unwrap();
        if ('update_visibility' in component) {
            component.update_visibility();
        }
        canvas.addComponent(component);
    }
    canvas.correctDimensions();
    console.log("site/loading Finished!");
    document.getElementById("loading-overlay").style.animation = 'fade-out-overlay 1s cubic-bezier(0.445, 0.05, 0.55, 0.95) forwards';
    canvas.transform.x = -470 + canvas.canvas.width / 2;
    canvas.transform.y = 1584 + canvas.canvas.height / 2;
    canvas.transform.scale = 1;
    canvas.raw_zoom(2.5, canvas.canvas.width / 2, canvas.canvas.height / 2);
    let abort_zoom = false;
    let abort_zoom_callback = () => abort_zoom = true;
    document.addEventListener('wheel', abort_zoom_callback);
    let zoom_iter_count = 100;
    let zoom_pid = setInterval(() => {
        canvas.zoom(zoom_iter_count / 2, canvas.canvas.width / 2, canvas.canvas.height / 2);
        zoom_iter_count -= 1;
        if (zoom_iter_count <= 0 || abort_zoom) {
            clearInterval(zoom_pid);
            document.removeEventListener('wheel', abort_zoom_callback);
        }
    }, 10);
});
class ACC_TransformState {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.buffered_x = 0;
        this.buffered_y = 0;
        this.scale = 1;
    }
}
class ACC_MouseState {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.pressed_x = 0;
        this.pressed_y = 0;
        this.pressed = false;
    }
}
class AutoCanvas {
    constructor() {
        this.canvas = wrap(document.createElement('canvas'))
            .set('className', 'autoCanvas')
            .pipe(document.body.appendChild.bind(document.body))
            .unwrap();
        this.ctx = this.canvas.getContext('2d');
        this.mouse_state = new ACC_MouseState();
        this.transform = new ACC_TransformState();
        this.debug_flag = true;
        this._components_civilian = [];
        this._components_priority = [];
        this._target_fps = 60;
        this.render_time = 0;
        this.correctDimensions();
        this.registerEventListeners();
        this.render_loop_pid = setInterval(this.refresh.bind(this), 1000 / this.target_fps);
    }
    get components() {
        return [].concat(this._components_civilian, this._components_priority);
    }
    get target_fps() { return this._target_fps; }
    set target_fps(value) {
        this._target_fps = value;
        clearInterval(this.render_loop_pid);
        this.render_loop_pid = setInterval(this.refresh.bind(this), 1000 / this.target_fps);
    }
    registerEventListeners() {
        document.addEventListener("mousedown", (event) => {
            this.mouse_state.pressed = true;
            this.mouse_state.pressed_x = event.x;
            this.mouse_state.pressed_y = event.y;
            this.transform.buffered_x = this.transform.x;
            this.transform.buffered_y = this.transform.y;
        });
        this.canvas.addEventListener("mousedown", (event) => {
            let found = false;
            for (let i = this.components.length - 1; i >= 0; i--) {
                if (this.components[i].collide(this.transform, event.x, event.y, ACC_EventType.PRESS, found)) {
                    found = true;
                }
            }
        });
        document.addEventListener("mouseup", (event) => {
            if (this.mouse_state.pressed) {
                this.mouse_state.pressed = false;
            }
        });
        this.canvas.addEventListener("mouseup", (event) => {
            let found = false;
            let drag_distance = ((this.mouse_state.pressed_x - event.x) ** 2 + (this.mouse_state.pressed_y - event.y) ** 2) ** 0.5;
            let event_type = drag_distance < 5 ? ACC_EventType.CLICK : ACC_EventType.RELEASE;
            for (let i = this.components.length - 1; i >= 0; i--) {
                if (this.components[i].collide(this.transform, event.x, event.y, event_type, found)) {
                    found = true;
                }
            }
        });
        document.addEventListener("mousemove", (event) => {
            this.mouse_state.x = event.x;
            this.mouse_state.y = event.y;
            if (this.mouse_state.pressed) {
                this.transform.x = this.transform.buffered_x
                    + event.x
                    - this.mouse_state.pressed_x;
                this.transform.y = this.transform.buffered_y
                    + event.y
                    - this.mouse_state.pressed_y;
            }
            let found = false;
            for (let i = this.components.length - 1; i >= 0; i--) {
                if (this.components[i].collide(this.transform, event.x, event.y, ACC_EventType.HOVER, found)) {
                    found = true;
                }
            }
        });
        window.addEventListener("resize", (event) => {
            this.correctDimensions();
            this.refresh();
            for (const comp of this.components) {
                comp.on_resize(comp);
            }
        });
        document.addEventListener("wheel", (event) => {
            this.zoom(event.deltaY, event.x, event.y);
        });
    }
    zoom(amount, about_x, about_y) {
        const SCALE_STRENGTH = 1.0005, SCALE_MIN = 0.1, SCALE_MAX = 15;
        const SCALE_AMT_MAX = SCALE_MAX / this.transform.scale, SCALE_AMT_MIN = SCALE_MIN / this.transform.scale;
        let scaleAmount = Math.pow(SCALE_STRENGTH, -amount);
        scaleAmount = Math.max(Math.min(scaleAmount, SCALE_AMT_MAX), SCALE_AMT_MIN);
        this.raw_zoom(scaleAmount, about_x, about_y);
    }
    raw_zoom(amount, about_x, about_y) {
        const SCALE_MIN = 0.1, SCALE_MAX = 15;
        this.transform.scale *= amount;
        this.transform.scale = Math.max(Math.min(this.transform.scale, SCALE_MAX), SCALE_MIN);
        this.transform.x = (this.transform.x) * amount - about_x * (amount - 1);
        this.transform.y = (this.transform.y) * amount - about_y * (amount - 1);
    }
    correctDimensions() {
        let ctx = this.canvas.getBoundingClientRect();
        this.canvas.width = ctx.width;
        this.canvas.height = ctx.height;
        this.ctx.imageSmoothingEnabled = false;
    }
    addComponent(component) {
        if (component.render_hoisted) {
            this._components_priority.push(component);
        }
        else {
            this._components_civilian.push(component);
        }
    }
    removeComponent(component) {
        if (component.render_hoisted) {
            let i = this._components_priority.indexOf(component);
            this._components_priority.splice(i, 1);
        }
        else {
            let i = this._components_civilian.indexOf(component);
            this._components_civilian.splice(i, 1);
        }
    }
    refresh() {
        let perf_start = performance.now();
        for (const component of this.components) {
            component.tick(1000 / this.target_fps);
        }
        this.ctx.fillStyle = "#292929";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (const component of this.components) {
            component.refresh(this.ctx, this.transform);
        }
        this.render_time = performance.now() - perf_start;
        if (this.debug_flag) {
            this.ctx.font = "18px futura";
            this.ctx.fillStyle = "black";
            this.ctx.fillText("Target MS: " + (1000 / this.target_fps).toFixed(0), 2, 22);
            this.ctx.fillStyle = "white";
            this.ctx.fillText("Target MS: " + (1000 / this.target_fps).toFixed(0), 0, 20);
            this.ctx.fillStyle = "black";
            this.ctx.fillText("Current MS: " + (this.render_time).toFixed(0), 2, 42);
            this.ctx.fillStyle = "white";
            this.ctx.fillText("Current MS: " + (this.render_time).toFixed(0), 0, 40);
            let r_mouse_x = Math.round((this.mouse_state.x - this.transform.x) / this.transform.scale);
            let r_mouse_y = Math.round((this.mouse_state.y - this.transform.y) / this.transform.scale);
            this.ctx.fillStyle = "black";
            this.ctx.fillText(`Looking at: (${r_mouse_x}, ${r_mouse_y})`, 2, 62);
            this.ctx.fillStyle = "white";
            this.ctx.fillText(`Looking at: (${r_mouse_x}, ${r_mouse_y})`, 0, 60);
        }
    }
}
var ACC_EventType;
(function (ACC_EventType) {
    ACC_EventType[ACC_EventType["HOVER"] = 0] = "HOVER";
    ACC_EventType[ACC_EventType["PRESS"] = 1] = "PRESS";
    ACC_EventType[ACC_EventType["CLICK"] = 2] = "CLICK";
    ACC_EventType[ACC_EventType["RELEASE"] = 3] = "RELEASE";
})(ACC_EventType || (ACC_EventType = {}));
class ACC_Component {
    constructor(parent, x, y) {
        this.render_ignore_translation = false;
        this.render_ignore_scaling = false;
        this.render_hoisted = false;
        this.render_base_scale = new ACC_Dynamic(1);
        this.is_hovering = false;
        this.is_clicked = false;
        this.on_resize = () => {
            this.x.fix();
            this.y.fix();
        };
        this.on_hover = () => { };
        this.on_hover_stop = () => { };
        this.on_press = () => { };
        this.on_click = () => { };
        this.on_release = () => { };
        this.verify = () => true;
        this.parent = parent;
        this.x = new ACC_Dynamic(x);
        this.y = new ACC_Dynamic(y);
    }
    tick(dt) {
        this.x.tick(dt);
        this.y.tick(dt);
        this.render_base_scale.tick(dt);
    }
    ;
    refresh(ctx, transform) {
        if (!this.verify(this)) {
            return;
        }
    }
    ;
    collide(transform, x, y, type, override) {
        return false;
    }
    ;
}
class ACC_Dynamic {
    constructor(value) {
        this.tasks = [];
        this.raw = value;
        this.mod = 0;
    }
    set(value) {
        if (typeof (value) == "number") {
            this.raw = value;
        }
        else {
            this.callback = value;
            this.fix();
        }
    }
    modify(value) {
        this.mod += value;
    }
    get() {
        return this.raw + this.mod;
    }
    fix() {
        if (this.callback) {
            this.raw = this.callback();
        }
    }
    addTask(task) {
        this.tasks.push(task);
    }
    tick(dt) {
        this.fix();
        for (const task of this.tasks) {
            task.tick(this, dt);
            if (task.is_dead()) {
                this.tasks.splice(this.tasks.indexOf(task), 1);
            }
        }
    }
}
class ACC_Foreign extends ACC_Component {
    constructor() {
        super(...arguments);
        this.static_offset_x = 0;
        this.static_offset_y = 0;
    }
    get_render_x(transform) {
        if (this.render_ignore_translation) {
            return this.x.get();
        }
        return this.x.get() * transform.scale + transform.x + this.static_offset_x;
    }
    get_render_y(transform) {
        if (this.render_ignore_translation) {
            return this.y.get();
        }
        return this.y.get() * transform.scale + transform.y + this.static_offset_y;
    }
}
class ACC_Image extends ACC_Component {
    constructor() {
        super(...arguments);
        this.render_centered = false;
    }
    tick(dt) {
        super.tick(dt);
    }
    ;
    refresh(ctx, transform) {
        if (!this.verify(this)) {
            return;
        }
        ctx.drawImage(this.img, this.get_render_x(transform), this.get_render_y(transform), this.get_render_width(transform), this.get_render_height(transform));
    }
    get_render_width(transform) {
        let width = this.img.width * this.render_base_scale.get();
        if (!this.render_ignore_scaling) {
            width *= transform.scale;
        }
        return width;
    }
    get_render_height(transform) {
        let height = this.img.height * this.render_base_scale.get();
        if (!this.render_ignore_scaling) {
            height *= transform.scale;
        }
        return height;
    }
    get_render_x(transform) {
        if (this.render_ignore_translation) {
            return this.x.get();
        }
        let x = this.x.get() * transform.scale + transform.x;
        if (this.render_centered) {
            x -= this.get_render_width(transform) / 2;
        }
        return x;
    }
    get_render_y(transform) {
        if (this.render_ignore_translation) {
            return this.y.get();
        }
        let y = this.y.get() * transform.scale + transform.y;
        if (this.render_centered) {
            y -= this.get_render_height(transform) / 2;
        }
        return y;
    }
    collide(transform, client_x, client_y, type, override) {
        if (!this.verify(this)) {
            return false;
        }
        let detected = override ? false : (client_x > this.get_render_x(transform) &&
            client_x < this.get_render_x(transform) + this.get_render_width(transform) &&
            client_y > this.get_render_y(transform) &&
            client_y < this.get_render_y(transform) + this.get_render_height(transform));
        switch (type) {
            case (ACC_EventType.HOVER):
                {
                    if (detected && !this.is_hovering) {
                        this.is_hovering = true;
                        this.on_hover(this);
                    }
                    else if (!detected && this.is_hovering) {
                        this.is_hovering = false;
                        this.on_hover_stop(this);
                    }
                }
                break;
            case (ACC_EventType.PRESS):
                {
                    if (detected && !this.is_clicked) {
                        this.is_clicked = true;
                        this.on_press(this);
                    }
                }
                break;
            case (ACC_EventType.CLICK): {
                if (detected) {
                    this.on_click(this);
                }
            }
            case (ACC_EventType.RELEASE):
                {
                    if (this.is_clicked) {
                        this.is_clicked = false;
                        this.on_release(this);
                    }
                }
                break;
        }
        return detected;
    }
    ;
}
var ACC_EaseType;
(function (ACC_EaseType) {
    ACC_EaseType[ACC_EaseType["LINEAR"] = 0] = "LINEAR";
})(ACC_EaseType || (ACC_EaseType = {}));
class ACC_Task {
    constructor(delta, ms, ease_type) {
        this.cur_ms = 0;
        this.delta = delta;
        this.max_ms = ms;
        this.ease_type = ease_type;
    }
    tick(target, dt) {
        switch (this.ease_type) {
            case (ACC_EaseType.LINEAR):
                {
                    this.cur_ms += dt;
                    target.modify(this.delta * (dt / this.max_ms));
                }
                break;
        }
    }
    is_dead() {
        return this.cur_ms >= this.max_ms;
    }
}
class UIPanel {
    static tryFetch(unique_id) {
        let target = document.getElementById(unique_id);
        if (target == null)
            return null;
        let ctx = new Returnable();
        target.dispatchEvent(new CustomEvent("ui-get", { 'detail': ctx }));
        return ctx.value;
    }
    constructor(args) {
        this.keep_visible = true;
        if (args.keep_visible !== undefined) {
            this.keep_visible = args.keep_visible;
        }
        if (args.unique_id && document.getElementById(args.unique_id) != null) {
            return;
        }
        this.panel = fast("div", { className: "ui-panel initial-fade" });
        if (args.unique_id) {
            this.panel.id = args.unique_id;
        }
        this.bar = fast("div", { className: "ui-move-bar" });
        if (args.include_close) {
            let button_close = fast("button", { className: "ui-nav-button ui-close" });
            button_close.addEventListener('click', this.dispose.bind(this));
            this.bar.appendChild(button_close);
        }
        if (args.include_navigation) {
            this.nav_left = fast("button", { className: "ui-nav-button ui-left ui-inactive" });
            this.bar.appendChild(this.nav_left);
            this.nav_left.addEventListener('click', this.navigateLeft.bind(this));
            this.nav_right = fast("button", { className: "ui-nav-button ui-right ui-inactive" });
            this.bar.appendChild(this.nav_right);
            this.nav_right.addEventListener('click', this.navigateRight.bind(this));
        }
        if (args.allow_dragging) {
            this.bar.addEventListener('mousedown', (e) => {
                let x = e.clientX, y = e.clientY;
                let panel_x = this.panel.offsetLeft, panel_y = this.panel.offsetTop;
                function on_mouse_up(e) {
                    document.removeEventListener('mouseup', on_mouse_up_bind);
                    document.removeEventListener('mousemove', on_mouse_move_bind);
                }
                function on_mouse_move(e) {
                    this.panel.style.top = `${panel_y + e.clientY - y}px`;
                    this.panel.style.left = `${panel_x + e.clientX - x}px`;
                    this.updateContentSize();
                }
                let on_mouse_up_bind = on_mouse_up.bind(this);
                let on_mouse_move_bind = on_mouse_move.bind(this);
                document.addEventListener('mouseup', on_mouse_up_bind);
                document.addEventListener('mousemove', on_mouse_move_bind);
            });
        }
        this.tabs = fast("div", { className: "ui-tabs" });
        this.content = fast("div", { className: "ui-content" });
        this.panel.addEventListener('ui-kill', this.dispose.bind(this));
        this.panel.addEventListener('ui-get', (e) => {
            e.detail['value'] = this;
        });
        this.resize_bind = this.updateContentSize.bind(this);
        window.addEventListener("resize", this.resize_bind);
        this.history_past = [];
        this.history_present = args.generator;
        this.history_future = [];
        this.generate(args.generator);
        this.panel.appendChild(this.bar);
        this.panel.appendChild(this.tabs);
        this.panel.appendChild(this.content);
        document.body.appendChild(this.panel);
        if (args.at) {
            this.panel.style.left = `${args.at[0]}px`;
            this.panel.style.top = `${args.at[1]}px`;
        }
        this.updateContentSize();
        setInterval(this.updateContentSize.bind(this), 150);
    }
    generate(generator) {
        this.wipeContent();
        this.wipeTabs();
        this.history_present = generator;
        generator.generator(this, generator.data);
    }
    updateContentSize(e) {
        if (this.keep_visible) {
            this.panel.style.top = `${Math.max(Math.min(this.panel.offsetTop, window.innerHeight - 32), 0)}px`;
            this.panel.style.left = `${Math.max(Math.min(this.panel.offsetLeft, window.innerWidth - 96), -this.panel.clientWidth + 64)}px`;
            this.content.style.maxHeight = `${window.innerHeight - this.content.getBoundingClientRect().y}px`;
        }
        this.content.style.maxHeight = `${window.innerHeight}px`;
    }
    dispose(e) {
        window.removeEventListener("resize", this.resize_bind);
        this.panel.classList.add('is-fading-out');
        setTimeout((() => { document.body.removeChild(this.panel); }), 150);
    }
    createTabs(...args) {
        let tab_row = fast("div", { className: "ui-tabs-row" });
        for (const item of args)
            tab_row.appendChild(fast("label", { innerText: item, className: "ui-tab", onclick: this.navigateTab.bind(this, item) }));
        this.tabs.appendChild(tab_row);
    }
    navigateTab(destination) {
        let copy;
        Object.assign(copy, this.history_present);
        copy.tab = destination;
        this.navigateTo(copy);
    }
    navigateLeft() {
        if (this.history_past.length == 0)
            return;
        this.history_future.unshift(this.history_present);
        this.generate(this.history_past.pop());
        if (this.history_past.length == 0)
            this.nav_left.classList.add('ui-inactive');
        if (this.history_future.length == 1)
            this.nav_right.classList.remove('ui-inactive');
    }
    navigateRight() {
        if (this.history_future.length == 0)
            return;
        this.history_past.push(this.history_present);
        this.generate(this.history_future.shift());
        if (this.history_past.length == 1)
            this.nav_left.classList.remove('ui-inactive');
        if (this.history_future.length == 0)
            this.nav_right.classList.add('ui-inactive');
    }
    navigateTo(destination, e) {
        if (e) {
            e.preventDefault();
            if (e.shiftKey) {
                new UIPanel({
                    include_close: true,
                    include_navigation: true,
                    generator: destination,
                    at: [this.panel.offsetLeft + 20, this.panel.offsetTop + 20]
                });
                return;
            }
        }
        this.nav_left.classList.remove('ui-inactive');
        this.nav_right.classList.add('ui-inactive');
        this.history_past.push(this.history_present);
        this.generate(destination);
        this.history_future = [];
    }
    wipeContent() {
        this.content.textContent = "";
    }
    wipeTabs() {
        this.tabs.textContent = "";
    }
    getContent() {
        return this.content;
    }
}
function appendChildren(parent, ...children) {
    for (const element of children) {
        parent.appendChild(element);
    }
}
function fast(tag, args = {}) {
    let element = document.createElement(tag);
    for (const [key, value] of Object.entries(args)) {
        if (key == "children") {
            appendChildren(element, ...value);
        }
        else {
            element[key] = value;
        }
    }
    return element;
}
class Returnable {
}
;
function wrap(object) {
    return new Wrapper(object);
}
class Wrapper {
    constructor(object) {
        this.object = object;
    }
    set(key, value) {
        if (this.object[key] instanceof ACC_Dynamic) {
            this.object[key].set(value);
        }
        else {
            this.object[key] = value;
        }
        return this;
    }
    pipe(func, ...args) {
        func(this.object, ...args);
        return this;
    }
    call(key, ...args) {
        this.object[key](...args);
        return this;
    }
    unwrap() {
        return this.object;
    }
}
async function await_event(object, event) {
    return await (() => new Promise((resolve) => object.addEventListener(event, resolve)))();
}
function travelPath(base, path) {
    for (const item of path) {
        base = base[item];
    }
    return base;
}
async function fetch_textures() {
    const inner_1 = (path = []) => {
        const target = travelPath(url.texture, path);
        for (const [id, obj] of Object.entries(target)) {
            if (typeof obj == "object") {
                inner_1([...path, id]);
                continue;
            }
            travelPath(texture, path)[id] = wrap(new Image()).set("src", obj).unwrap();
            console.log(`site/loading_resource: texture/${path.length > 0 ? path + '/' : ''}${id}`);
        }
    };
    inner_1();
    const inner_2 = async (path = []) => {
        const target = travelPath(texture, path);
        for (const [id, obj] of Object.entries(target)) {
            if (typeof obj == "object") {
                await inner_2([...path, id]);
                continue;
            }
            if (!obj.complete) {
                await await_event(texture.frame_active[id], "loaded");
            }
        }
    };
    await inner_2();
}
async function fetch_map() {
    return await (() => {
        return new Promise((resolve) => {
            fetch(url.wynntils.map_json)
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => { throw err; });
        });
    })();
}
function flatten_content(content) {
    return [].concat(content.cave, content.miniQuest, content.quest, content.bossAltar, content.dungeon, content.raid, content.lootrunCamp, content.secretDiscovery, content.territorialDiscovery, content.worldDiscovery);
}
async function fetch_content() {
    let content = await (() => {
        return new Promise((resolve) => {
            fetch(url.wynntils.content_book_json)
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => { throw err; });
        });
    })();
    let content_patch = await (() => {
        return new Promise((resolve) => {
            fetch(url.wynndex.content_book_json)
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => { throw err; });
        });
    })();
    let data = {};
    for (const item of flatten_content(content)) {
        data[`${item.type}_${item.name}`] = item;
    }
    for (const item of content_patch) {
        for (const [key, value] of Object.entries(item)) {
            if (key == "name" || key == "type") {
                continue;
            }
            data[`${item.type}_${item.name}`][key] = value;
        }
    }
    for (const item of Object.values(data)) {
        let color_format_index;
        while ((color_format_index = item.description.indexOf('\u00a7')) != -1) {
            item.description = item.description.slice(0, color_format_index) + item.description.slice(color_format_index + 2);
        }
        for (let i = 0; i < item.requirements.quests.length; i++) {
            while ((color_format_index = item.requirements.quests[i].indexOf('\u058E')) != -1) {
                item.requirements.quests[i] = item.requirements.quests[i].slice(0, color_format_index) + item.requirements.quests[i].slice(color_format_index + 2);
            }
        }
    }
    for (const item of Object.values(data)) {
        if (item.location == null) {
        }
    }
    return data;
}
