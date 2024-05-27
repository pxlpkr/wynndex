/* Prevent right clicking */
document.addEventListener("contextmenu", (event) => {
    event.stopPropagation();
    event.preventDefault();
    return false;
})

/* Main */
document.addEventListener("DOMContentLoaded", async () => {
    let reporter = new ProgressReporter(0);

    // Build Canvas
    canvas = new AutoCanvas();

    // Query map textures
    reporter.set_weight(5);
    const map_json: JSON_Wynntils_Map[] = await fetch_map();
    for (const part of map_json) {
        url.texture.map[part.name] = part.url;
    }
    reporter.report(100, "Downloaded map data");

    // Fetch all textures
    reporter.set_weight(80);
    await fetch_textures(reporter);

    // Fetch content
    reporter.set_weight(10);
    content = await fetch_content();
    reporter.report(100, `Loaded content book`);

    // Create map elements
    reporter.set_weight(5);
    for (const part of map_json) {
        if (part.name == "The Void") {
            part.x1 = 1600;
            part.z1 = -6000;
        }

        let component = wrap(new ACC_Image(canvas, part.x1, part.z1))
            .set('img', texture.map[part.name])
            .unwrap();
        canvas.addComponent(component);
    }

    /* Make settings buttons */
    let component: ACC_Image = wrap(new ACC_Image(canvas, 4, canvas.canvas.height - 2))
        .set('render_ignore_scaling', true)
        .set('render_ignore_translation', true)
        .set('render_hoisted', true)
        .set('render_base_scale', 4)
        .set('img', texture.opt_filter)
        .unwrap();
    component.y.set(() => canvas.canvas.height - 72);
    component.on_hover = (c: ACC_Image) => c.y.addTask(new ACC_Task(-12, 150, ACC_EaseType.LINEAR));
    component.on_hover_stop = (c: ACC_Image) => c.y.addTask(new ACC_Task(12, 150, ACC_EaseType.LINEAR));
    component.on_press = (c: ACC_Image) => c.y.addTask(new ACC_Task(16, 100, ACC_EaseType.LINEAR));
    component.on_release = (c: ACC_Image) => c.y.addTask(new ACC_Task(-16, 100, ACC_EaseType.LINEAR));
    component.on_click = (_: ACC_Image) => {
        let ui_id = 'opt_filter';
        if (UIPanel.tryFetch('opt_filter')) {
            UIPanel.tryFetch(ui_id).dispose();
        } else {
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

    /* Make poi markers */
    for (const [_, item] of Object.entries(content)) {
        if (item.location == undefined || typeof item.location === "string") {
            continue;
        }

        let component: ACC_Image = wrap(new ACC_Image(canvas, item.location.x, item.location.z))
            .set('img', texture.frame_active[item.type])
            .set('render_ignore_scaling', true)
            .set('render_centered', true)
            .set('render_base_scale', 2)
            .set('verify', () => {
                if (item.type == "storylineQuest") {
                    if (!options.view["quest"]) {
                        return false;
                    }
                } else if (!options.view[item.type]) {
                    return false;
                }

                if (options.filter.length > 0) {
                    if (!item.name.toLowerCase().includes(options.filter.toLowerCase())) {
                        return false;
                    }
                }
                return true;
            })
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
                            'generator': (() => {switch(item.type) {
                                case "quest":           return generate_ui_quest;
                                case "storylineQuest":  return generate_ui_quest;
                                case "miniQuest":       return generate_ui_miniquest;
                                case "cave":            return generate_ui_cave;
                                case "dungeon":         return generate_ui_dungeon;

                                case "bossAltar":       return generate_ui_bossaltar;
                                case "lootrunCamp":     return generate_ui_lootrun;
                                case "raid":            return generate_ui_raid;

                                case "secretDiscovery": return generate_ui_secret_discovery;
                                case "worldDiscovery":  return generate_ui_world_discovery;
                                case "territorialDiscovery": return generate_ui_territorial_discovery;
                            }})(),
                            'data': item
                        },
                        at: [-1000, -1000]
                    });
                    panelComponent.refresh = ((ctx: CanvasRenderingContext2D, transform: ACC_TransformState) => {
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
            (component.update_visibility as () => void)();
        }
        canvas.addComponent(component);
    }

    canvas.correctDimensions();
    reporter.report(100, "Initialized map");

    reporter.complete();
    console.log("site/loading Finished!");
    document.getElementById("loading-overlay").style.animation = 'fade-out-overlay 1s cubic-bezier(0.445, 0.05, 0.55, 0.95) forwards';

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
});