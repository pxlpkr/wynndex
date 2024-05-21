const parse_profession_levels = (inp) => {
    let out = [];
    for (const [key, value] of Object.entries(inp)) {
        out.push(`${key} ${value}`);
    }
    return out;
};
const generate_ui_cave = (ui, data) => {
    ui.getContent().appendChild(fast("div", { className: "ui-container ui-padded", children: [
            fast("label", { innerText: data.name, className: "ui-label center-text ui-title" }),
            fast("label", { innerText: `Level ${data.requirements.level} ${data.specialInfo ? data.specialInfo : data.type}`, className: "ui-label center-text broad-text ui-subtitle" }),
            fast("hr", { className: "ui-separator" }),
            fast("label", { innerText: `Length: ${data.length} (${data.lengthInfo})`, className: "ui-label small-text" }),
            fast("label", { innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text" }),
            fast("label", { innerText: `rewards: \n+ ${data.rewards.join("\n+ ")}`, className: "ui-label broad-text small-text" }),
        ] }));
};
const generate_ui_bossaltar = (ui, data) => {
    ui.getContent().appendChild(fast("div", { className: "ui-container ui-padded", children: [
            fast("label", { innerText: data.name, className: "ui-label center-text ui-title" }),
            fast("label", { innerText: `Level ${data.requirements.level} Boss Altar`, className: "ui-label center-text broad-text ui-subtitle" }),
            fast("hr", { className: "ui-separator" })
        ] }));
};
const generate_ui_quest = (ui, data) => {
    let container = fast("div", { className: "ui-container ui-padded", children: [
            fast("label", { innerText: data.name, className: "ui-label center-text ui-title" }),
            fast("label", { innerText: `Level ${data.requirements.level} ${data.type == 'storylineQuest' ? 'Storyline ' : ''}Quest${data.specialInfo != 'Storyline' ? '\n' + data.specialInfo : ''}`, className: "ui-label center-text broad-text ui-subtitle" }),
            fast("hr", { className: "ui-separator" }),
            fast("label", { innerText: `Length: ${data.length}`, className: "ui-label small-text" }),
            fast("label", { innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text" }),
        ] });
    if (data.requirements.quests.length > 0 || Object.keys(data.requirements.professionLevels).length > 0) {
        container.appendChild(fast("label", { innerText: (`Requirements:` +
                (data.requirements.quests.length > 0 ? `\n- ${data.requirements.quests.join("\n- ")}` : '') +
                (Object.keys(data.requirements.professionLevels).length > 0 ? `\n- ${parse_profession_levels(data.requirements.professionLevels).join("\n- ")}` : '')),
            className: "ui-label broad-text small-text" }));
    }
    container.appendChild(fast("label", { innerText: `Rewards: \n+ ${data.rewards.join("\n+ ")}`, className: "ui-label broad-text small-text" }));
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
    container.appendChild(fast("label", { innerText: `Rewards: \n+ ${data.rewards.join("\n+ ")}`, className: "ui-label broad-text small-text" }));
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
    if (data.requirements.quests.length > 0 || Object.keys(data.requirements.professionLevels).length > 0) {
        container.appendChild(fast("label", { innerText: (`Requirements:` +
                (data.requirements.quests.length > 0 ? `\n- ${data.requirements.quests.join("\n- ")}` : '') +
                (Object.keys(data.requirements.professionLevels).length > 0 ? `\n- ${parse_profession_levels(data.requirements.professionLevels).join("\n- ")}` : '')),
            className: "ui-label broad-text small-text" }));
    }
    container.appendChild(fast("label", { innerText: `Rewards: \n+ ${data.rewards.join("\n+ ")}`, className: "ui-label broad-text small-text" }));
    ui.getContent().appendChild(container);
};
document.addEventListener("DOMContentLoaded", async () => {
    let map_json = await (() => {
        return new Promise((resolve) => {
            fetch("https://raw.githubusercontent.com/Wynntils/WynntilsWebsite-API/master/maps/maps.json")
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => { throw err; });
        });
    })();
    let canvas = new AutoCanvas();
    window['debug'] = { 'canvas': canvas };
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
    for (const part of map_json) {
        let map_fragment = wrap(new Image())
            .set("src", part.url)
            .unwrap();
        let component = wrap(new ACC_Image(canvas, part.x1, part.z1))
            .set('img', map_fragment)
            .unwrap();
        canvas.addComponent(component);
    }
    let opt_filter = wrap(new Image())
        .set("src", "rsc/opt_filter.png")
        .unwrap();
    let component = wrap(new ACC_Image(canvas, 4, canvas.canvas.height - 2))
        .set('render_ignore_scaling', true)
        .set('render_ignore_translation', true)
        .set('render_hoisted', true)
        .set('render_base_scale', 2)
        .set('img', opt_filter)
        .unwrap();
    component.y.set(() => canvas.canvas.height - component.get_render_height(canvas.transform) - 4);
    canvas.addComponent(component);
    let content = await wdload_content();
    let frame_boss_a = wrap(new Image()).set("src", "rsc/frame_boss_a.png").unwrap();
    let frame_cave_a = wrap(new Image()).set("src", "rsc/frame_cave_a.png").unwrap();
    let frame_discovery_a = wrap(new Image()).set("src", "rsc/frame_miniquest_a.png").unwrap();
    let frame_dungeon_a = wrap(new Image()).set("src", "rsc/frame_dungeon_a.png").unwrap();
    let frame_lootrun_a = wrap(new Image()).set("src", "rsc/frame_lootrun_a.png").unwrap();
    let frame_miniquest_a = wrap(new Image()).set("src", "rsc/frame_miniquest_a.png").unwrap();
    let frame_quest_a = wrap(new Image()).set("src", "rsc/frame_quest_a.png").unwrap();
    let frame_raid_a = wrap(new Image()).set("src", "rsc/frame_raid_a.png").unwrap();
    let frame_story_a = wrap(new Image()).set("src", "rsc/frame_story_a.png").unwrap();
    for (const [_, item] of Object.entries(content)) {
        if (!item.location) {
            continue;
        }
        let component = build_poi(item, (() => {
            switch (item.type) {
                case "quest": return frame_quest_a;
                case "storylineQuest": return frame_story_a;
                case "miniQuest": return frame_miniquest_a;
                case "cave": return frame_cave_a;
                case "dungeon": return frame_dungeon_a;
                case "bossAltar": return frame_boss_a;
                case "lootrunCamp": return frame_lootrun_a;
                case "raid": return frame_raid_a;
            }
        })(), (() => {
            switch (item.type) {
                case "quest": return generate_ui_quest;
                case "storylineQuest": return generate_ui_quest;
                case "miniQuest": return generate_ui_miniquest;
                case "cave": return generate_ui_cave;
                case "dungeon": return generate_ui_dungeon;
                case "bossAltar": return generate_ui_bossaltar;
                case "lootrunCamp": return generate_ui_cave;
                case "raid": return generate_ui_cave;
            }
        })(), canvas);
        canvas.addComponent(component);
    }
});
const WYNNTILS_API_CONTENT_BOOK = "https://raw.githubusercontent.com/Wynntils/Static-Storage/main/Data-Storage/raw/content/content_book_dump.json";
const WYNNDEX_API_CONTENT_BOOK = "https://wynndex.github.io/api/content_book.json";
function flatten_content(content) {
    return [].concat(content.cave, content.miniQuest, content.quest, content.bossAltar, content.dungeon, content.raid, content.lootrunCamp);
}
async function wdload_content() {
    let content = await (() => {
        return new Promise((resolve) => {
            fetch(WYNNTILS_API_CONTENT_BOOK)
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => { throw err; });
        });
    })();
    let content_patch = await (() => {
        return new Promise((resolve) => {
            fetch(WYNNDEX_API_CONTENT_BOOK)
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
            if ([null, undefined, ""].includes(data[`${item.type}_${item.name}`][key]) || data[`${item.type}_${item.name}`][key].length == 0) {
                data[`${item.type}_${item.name}`][key] = value;
            }
        }
    }
    for (const item of Object.values(data)) {
        let color_format_index;
        while ((color_format_index = item.description.indexOf('\u00a7')) != -1) {
            item.description = item.description.slice(0, color_format_index) + item.description.slice(color_format_index + 2);
        }
    }
    return data;
}
function build_poi(item, image, generator, canvas) {
    return wrap(new ACC_Image(canvas, item.location.x, item.location.z))
        .set('img', image)
        .set('render_ignore_scaling', true)
        .set('render_centered', true)
        .set('render_base_scale', 2)
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
        this.canvas.addEventListener("mousedown", (event) => {
            this.mouse_state.pressed = true;
            this.mouse_state.pressed_x = event.x;
            this.mouse_state.pressed_y = event.y;
            this.transform.buffered_x = this.transform.x;
            this.transform.buffered_y = this.transform.y;
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
        this.canvas.addEventListener("wheel", (event) => {
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
            this.ctx.fillText("Current MS: " + (this.render_time), 2, 42);
            this.ctx.fillStyle = "white";
            this.ctx.fillText("Current MS: " + (this.render_time), 0, 40);
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
    refresh(ctx, transform) { }
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
class ACC_Image extends ACC_Component {
    constructor() {
        super(...arguments);
        this.render_centered = false;
    }
    tick(dt) {
        super.tick(dt);
        this.render_base_scale.tick(dt);
    }
    ;
    refresh(ctx, transform) {
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
        this.panel.addEventListener('mousedown', (e) => {
            this.panel.classList.remove('initial-fade');
            this.panel.parentNode.appendChild(this.panel);
        });
        if (args.allow_dragging) {
            this.bar.addEventListener('mousedown', (e) => {
                var x = e.clientX, y = e.clientY;
                var panel_x = this.panel.offsetLeft, panel_y = this.panel.offsetTop;
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
        this.panel.style.top = `${Math.max(Math.min(this.panel.offsetTop, window.innerHeight - 32), 0)}px`;
        this.panel.style.left = `${Math.max(Math.min(this.panel.offsetLeft, window.innerWidth - 96), -this.panel.clientWidth + 64)}px`;
        this.content.style.maxHeight = `${window.innerHeight - this.content.getBoundingClientRect().y}px`;
    }
    dispose(e) {
        window.removeEventListener("resize", this.resize_bind);
        this.panel.classList.add('is-fading-out');
        setTimeout((() => { document.body.removeChild(this.panel); }).bind(this), 150);
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
const wrap = (object) => new Wrapper(object);
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
