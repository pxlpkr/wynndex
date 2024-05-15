/* Main */
document.addEventListener("DOMContentLoaded", async () => {
    /* Get Map JSON */
    let map_json: JSON_Wynntils_Map[] = await (() => {
        return new Promise((resolve) => {
            fetch("https://raw.githubusercontent.com/Wynntils/WynntilsWebsite-API/master/maps/maps.json")
                .then(res => res.json())
                .then(out => resolve(out))
                .catch(err => {throw err});
        })
    })();


    let canvas: AutoCanvas = new AutoCanvas();
    window['debug'] = {'canvas': canvas};
    
    // Zoom on page load
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

    // Make map textures
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
    let frame_boss_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_boss_a.png").unwrap();
    let frame_cave_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_cave_a.png").unwrap();
    let frame_discovery_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_miniquest_a.png").unwrap();
    let frame_dungeon_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_dungeon_a.png").unwrap();
    let frame_lootrun_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_lootrun_a.png").unwrap();
    let frame_miniquest_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_miniquest_a.png").unwrap();
    let frame_quest_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_quest_a.png").unwrap();
    let frame_raid_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_raid_a.png").unwrap();
    let frame_story_a: HTMLImageElement = wrap(new Image()).set("src", "rsc/frame_story_a.png").unwrap();
    const empty: JSON_Content_Item[] = [];
    for (const [key, item] of Object.entries(content)) {
        if (!item.location) {
            continue;
        }

        let component = build_poi(item, (() => {switch(item.type) {
            case "quest":           return frame_quest_a;
            case "storylineQuest":  return frame_story_a;
            case "miniQuest":       return frame_miniquest_a;
            case "cave":            return frame_cave_a;
            case "dungeon":         return frame_dungeon_a;
            case "bossAltar":       return frame_boss_a;
            case "lootrunCamp":     return frame_lootrun_a;
            case "raid":            return frame_raid_a;
        }})(), (() => {switch(item.type) {
            case "quest":           return generate_ui_quest;
            case "storylineQuest":  return generate_ui_quest;
            case "miniQuest":       return generate_ui_miniquest;
            case "cave":            return generate_ui_cave;
            case "dungeon":         return generate_ui_dungeon;

            case "bossAltar":       return generate_ui_cave;
            case "lootrunCamp":     return generate_ui_cave;
            case "raid":            return generate_ui_cave;
        }})(), canvas);
        canvas.addComponent(component);
    }
});