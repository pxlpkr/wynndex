/* UIPanel */
const generate_ui_cave = (ui: UIPanel, data: JSONFormat_WynntilsCave) => {
    ui.getContent().appendChild(
        fast("div", {className: "ui-container ui-padded", children: [
            fast("label", {innerText: data.name, className: "ui-label center-text title-text"}),
            fast("label", {innerText: `Level ${data.requirements} ${data.specialInfo ? data.specialInfo : data.type}`, className: "ui-label center-text broad-text small-text"}),
            fast("hr", {className: "ui-separator"}),
            fast("label", {innerText: `Length: ${data.length} (${data.lengthInfo})`, className: "ui-label broad-text small-text"}),
            fast("label", {innerText: `rewards: \n+ ${data.rewards.join("\n+ ")}`, className: "ui-label broad-text small-text"}),
            // fast("label", {innerText: `Culture: `, className: "ui-label broad-text", children: [
            //     fast("span", {innerText: "TEST", className: "ui-info-box ui-redirect",
            //         // onclick: ((e) => {this.navigateTo({type: 'culture', data: {selector: culture}}, e)}).bind(this)
            //     })
            // ]}),
            // fast("label", {innerText: `Religion: `, className: "ui-label broad-text", children: [
            //     fast("span", {innerText: "TEST", className: "ui-info-box ui-redirect",
            //         // onclick: ((e) => {this.navigateTo({type: 'religion', data: {selector: religion}}, e)}).bind(this)
            //     })
            // ]}),
            // fast("label", {innerText: 'Stability: ', className: "ui-label broad-text", children: [
            //     fast("span", {innerText: '40.37', className: "ui-info-box"})
            // ]}),
            // fast("label", {innerText: 'War Support: ', className: "ui-label broad-text", children: [
            //     fast("span", {innerText: '98.2', className: "ui-info-box"})
            // ]})
        ]})
    );
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
    for (const part of map_json) {
        let opt_filter: HTMLImageElement = wrap(new Image())
            .set("src", "rsc/opt_filter.png")
            .unwrap();
        let component = wrap(new ACC_Image(canvas, 200, 200))
            .set('render_ignore_scaling', true)
            .set('render_ignore_translation', true)
            .set('render_hoisted', true)
            .set('render_base_scale', 2)
            .set('img', opt_filter)
            .unwrap();
        canvas.addComponent(component);
    }

    /* Make cave markers */
    let caves = await wdload_caves();
    let frame_cave_a: HTMLImageElement = wrap(new Image())
        .set("src", "rsc/frame_cave_a.png")
        .unwrap();
    for (const cave of caves) {
        let component = wrap(new ACC_Image(canvas, cave.location.x, cave.location.z))
            .set('img', frame_cave_a)
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
                let ui_id = `cave_${cave.name}`;
                if (UIPanel.tryFetch(ui_id)) {
                    UIPanel.tryFetch(ui_id).dispose();
                } else {
                    new UIPanel({
                        include_close: true,
                        include_navigation: true,
                        unique_id: ui_id,
                        generator: {
                            'type': 'cave',
                            'generator': generate_ui_cave,
                            'data': cave
                        },
                        at: [c.get_render_x(canvas.transform) + c.get_render_width(canvas.transform) + 2,
                            c.get_render_y(canvas.transform)]
                    });
                }
            })
            .unwrap();
        canvas.addComponent(component);
    }
});