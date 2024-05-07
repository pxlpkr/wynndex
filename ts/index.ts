/** Main **/
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
            .unwrap();
        canvas.addComponent(component);
    }
});