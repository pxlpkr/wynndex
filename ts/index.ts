/* UIPanel */
const generate_ui_cave = (ui: UIPanel, data: JSONFormat_ContentItem) => {
    ui.getContent().appendChild(
        fast("div", {className: "ui-container ui-padded", children: [
            fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
            fast("label", {innerText: `Level ${data.requirements.level} ${data.specialInfo ? data.specialInfo : data.type}`, className: "ui-label center-text broad-text ui-subtitle"}),
            fast("hr", {className: "ui-separator"}),
            fast("label", {innerText: `Length: ${data.length} (${data.lengthInfo})`, className: "ui-label broad-text small-text"}),
            fast("label", {innerText: `rewards: \n+ ${data.rewards.join("\n+ ")}`, className: "ui-label broad-text small-text"}),
        ]})
    );
};

const parse_profession_levels = (inp) => {
    let out: string[] = [];
    for (const [key, value] of Object.entries(inp)) {
        out.push(`${key} ${value}`);
    }
    return out;
}

const generate_ui_quest = (ui: UIPanel, data: JSONFormat_ContentItem) => {
    let container = fast("div", {className: "ui-container ui-padded", children: [
        fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
        fast("label", {innerText: `Level ${data.requirements.level} ${data.type == 'storylineQuest' ? 'Storyline ' : ''}Quest${data.specialInfo != 'Storyline' ? '\n' + data.specialInfo : ''}`, className: "ui-label center-text broad-text ui-subtitle"}),
        fast("hr", {className: "ui-separator"}),
        fast("label", {innerText: `Length: ${data.length}`, className: "ui-label broad-text small-text"}),
    ]});
    if (data.requirements.quests.length > 0 || Object.keys(data.requirements.professionLevels).length > 0) {
        container.appendChild(fast("label", {innerText: (`Requirements:` + 
        (data.requirements.quests.length > 0 ? `\n- ${data.requirements.quests.join("\n- ")}` : '') +
        (Object.keys(data.requirements.professionLevels).length > 0 ? `\n- ${parse_profession_levels(data.requirements.professionLevels).join("\n- ")}` : '')),
        className: "ui-label broad-text small-text"}))
    }
    container.appendChild(fast("label", {innerText: `Rewards: \n+ ${data.rewards.join("\n+ ")}`, className: "ui-label broad-text small-text"}));
    ui.getContent().appendChild(container);
};

const generate_ui_miniquest = (ui: UIPanel, data: JSONFormat_ContentItem) => {
    let container = fast("div", {className: "ui-container ui-padded", children: [
        fast("label", {innerText: data.name, className: "ui-label center-text ui-title"})
    ]});
    if (data.requirements.level != 0) {
        container.appendChild(fast("label", {innerText: `Level ${data.requirements.level} Combat Mini-Quest`, className: "ui-label center-text broad-text ui-subtitle"}));
    } else {
        let target = Object.entries(data.requirements.professionLevels)[0];
        container.appendChild(fast("label", {innerText: `Level ${target[1]} ${target[0]} Mini-Quest`, className: "ui-label center-text broad-text ui-subtitle"}));
    }
    container.appendChild(fast("hr", {className: "ui-separator"}));
    container.appendChild(fast("label", {innerText: `Length: ${data.length}`, className: "ui-label broad-text small-text"}));
    container.appendChild(fast("label", {innerText: `Rewards: \n+ ${data.rewards.join("\n+ ")}`, className: "ui-label broad-text small-text"}));
    ui.getContent().appendChild(container);
};

const generate_ui_dungeon = (ui: UIPanel, data: JSONFormat_ContentItem) => {
    let container = fast("div", {className: "ui-container ui-padded", children: [
        fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
        fast("label", {innerText: `Level ${data.requirements.level} Dungeon`, className: "ui-label center-text broad-text ui-subtitle"}),
        fast("hr", {className: "ui-separator"}),
        fast("label", {innerText: `Length: ${data.length}`, className: "ui-label broad-text small-text"}),
    ]});
    if (data.requirements.quests.length > 0 || Object.keys(data.requirements.professionLevels).length > 0) {
        container.appendChild(fast("label", {innerText: (`Requirements:` + 
        (data.requirements.quests.length > 0 ? `\n- ${data.requirements.quests.join("\n- ")}` : '') +
        (Object.keys(data.requirements.professionLevels).length > 0 ? `\n- ${parse_profession_levels(data.requirements.professionLevels).join("\n- ")}` : '')),
        className: "ui-label broad-text small-text"}))
    }
    container.appendChild(fast("label", {innerText: `Rewards: \n+ ${data.rewards.join("\n+ ")}`, className: "ui-label broad-text small-text"}));
    ui.getContent().appendChild(container);
};

/* Main */
document.addEventListener("DOMContentLoaded", async () => {
    /* Get Map JSON */
    let map_json: JSONFormat_WynntilsMap[] = await (() => {
        return new Promise((resolve) => {
            fetch("https://raw.githubusercontent.com/Wynntils/WynntilsWebsite-API/master/maps/maps.json")
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => {throw err});
        })
    })();


    let canvas: AutoCanvas = new AutoCanvas();
    window['debug'] = {'canvas': canvas};
    
    /* Zoom on page load */
    canvas.transform.x = -470 + canvas.canvas.width / 2; //265;
    canvas.transform.y = 1584 + canvas.canvas.height / 2; //1981;
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

    /* Make map textures */
    for (const part of map_json) {
        let map_fragment: HTMLImageElement = wrap(new Image())
            .set("src", part.url)
            .unwrap();
        let component = wrap(new ACC_Image(canvas, part.x1, part.z1))
            .set('img', map_fragment)
            .unwrap();
        canvas.addComponent(component);
    }

    /* Make settings textures */
    let opt_filter: HTMLImageElement = wrap(new Image())
        .set("src", "rsc/opt_filter.png")
        .unwrap();
    let component: ACC_Image = wrap(new ACC_Image(canvas, 4, canvas.canvas.height - 2))
        .set('render_ignore_scaling', true)
        .set('render_ignore_translation', true)
        .set('render_hoisted', true)
        .set('render_base_scale', 2)
        .set('img', opt_filter)
        .unwrap();
    component.y.set(() => canvas.canvas.height - component.get_render_height(canvas.transform) - 4);
    canvas.addComponent(component);

    /* Make poi markers */
    let content = await wdload_content();
    let backup = await wdload_content_local();
    let frame_boss_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_boss_a.png").unwrap();
    let frame_cave_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_cave_a.png").unwrap();
    let frame_discovery_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_miniquest_a.png").unwrap();
    let frame_dungeon_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_dungeon_a.png").unwrap();
    let frame_lootrun_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_lootrun_a.png").unwrap();
    let frame_miniquest_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_miniquest_a.png").unwrap();
    let frame_quest_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_quest_a.png").unwrap();
    let frame_raid_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_raid_a.png").unwrap();
    let frame_story_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_story_a.png").unwrap();
    const empty: JSONFormat_ContentItem[] = [];
    for (const item of empty.concat(content.cave, content.miniQuest, content.quest, content.dungeon)) {
        if (!item.location) {
            continue;
        }

        let component = build_poi(item, (() => {switch(item.type) {
            case "quest":   return frame_quest_a;
            case "storylineQuest":   return frame_story_a;
            case "miniQuest":   return frame_miniquest_a;
            case "cave":    return frame_cave_a;
            case "dungeon":   return frame_dungeon_a;
        }})(), (() => {switch(item.type) {
            case "quest":   return generate_ui_quest;
            case "storylineQuest":   return generate_ui_quest;
            case "miniQuest":   return generate_ui_miniquest;
            case "cave":    return generate_ui_cave;
            case "dungeon":   return generate_ui_dungeon;
        }})(), canvas);
        canvas.addComponent(component);
    }
});