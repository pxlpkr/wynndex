enum ACC_EaseType {
    LINEAR
}

enum ACC_EventType {
    HOVER,
    CLICK,
    RELEASE
}

enum ACC_ComponentState {
    IDLE,
    HOVERING
}

class ACC_Task {
    delta: number;
    cur_ms: number = 0;
    max_ms: number;
    ease_type: ACC_EaseType;

    constructor(delta: number, ms: number, ease_type: ACC_EaseType) {
        this.delta = delta;
        this.max_ms = ms;
        this.ease_type = ease_type;
    }

    tick(target: ACC_Dynamic, dt: number): void {
        switch (this.ease_type) {
            case (ACC_EaseType.LINEAR): {
                this.cur_ms += dt;
                target.set(target.get() + this.delta * (dt / this.max_ms));
            } break;
        }
    }

    is_dead(): boolean {
        return this.cur_ms >= this.max_ms;
    }
}

class ACC_Dynamic {
    raw: number;

    constructor(value: number) {
        this.raw = value;
    }

    set(value: number): void {
        this.raw = value;
    }

    get(): number {
        return this.raw;
    }

    /* Tasks */
    tasks: ACC_Task[] = [];

    addTask(task: ACC_Task): void {
        this.tasks.push(task);
    }

    tick(dt: number): void {
        for (const task of this.tasks) {
            task.tick(this, dt);
            if (task.is_dead()) {
                this.tasks.splice(this.tasks.indexOf(task), 1);
            }
        }
    }
}

class ACC_Component {
    parent: AutoCanvas;
    state: ACC_ComponentState = ACC_ComponentState.IDLE;

    x: ACC_Dynamic = new ACC_Dynamic(0);
    y: ACC_Dynamic = new ACC_Dynamic(0);

    on_hover: (c: ACC_Component) => void = () => {};
    on_hover_stop: (c: ACC_Component) => void = () => {};

    constructor(parent: AutoCanvas, x: number, y: number) {
        this.parent = parent;
        this.x.set(x);
        this.y.set(y);
    }

    tick(dt: number): void {
        this.x.tick(dt);
        this.y.tick(dt);
    };

    refresh(ctx: CanvasRenderingContext2D, transform: TransformStateType): void {};
    collide(transform: TransformStateType, x: number, y: number, type: ACC_EventType, override: boolean): boolean {
        return false;
    };
}

class ACC_Image extends ACC_Component {
    img: HTMLImageElement;
    render_ignore_scaling: boolean = false;
    render_centered: boolean = false;

    render_base_scale: ACC_Dynamic = new ACC_Dynamic(1);

    tick(dt: number): void {
        super.tick(dt);
        this.render_base_scale.tick(dt);
    };

    refresh(ctx: CanvasRenderingContext2D, transform: TransformStateType): void {
        ctx.drawImage(this.img, 
            this.get_render_x(transform), this.get_render_y(transform),
            this.get_render_width(transform), this.get_render_height(transform)
        );
    }

    get_render_width(transform: TransformStateType) {
        let width = this.img.width * this.render_base_scale.get();
        if (!this.render_ignore_scaling) {
            width *= transform.scale;
        }
        return width;
    }

    get_render_height(transform: TransformStateType) {
        let height = this.img.height * this.render_base_scale.get();
        if (!this.render_ignore_scaling) {
            height *= transform.scale;
        }
        return height;
    }
    
    get_render_x(transform: TransformStateType) {
        let x = this.x.get() * transform.scale + transform.x;
        if (this.render_centered) {
            x -= this.get_render_width(transform) / 2;
        }
        return x;
    }

    get_render_y(transform: TransformStateType) {
        let y = this.y.get() * transform.scale + transform.y;
        if (this.render_centered) {
            y -= this.get_render_height(transform) / 2;
        }
        return y;
    }

    collide(transform: TransformStateType, client_x: number, client_y: number, type: ACC_EventType, override: boolean): boolean {
        let detected = override ? false : (client_x > this.get_render_x(transform) &&
            client_x < this.get_render_x(transform) + this.get_render_width(transform) &&
            client_y > this.get_render_y(transform) &&
            client_y < this.get_render_y(transform) + this.get_render_height(transform));
        if (type == ACC_EventType.HOVER) {
            if (detected && this.state == ACC_ComponentState.IDLE) {
                this.state = ACC_ComponentState.HOVERING;
                this.on_hover(this);
            } else if (!detected && this.state == ACC_ComponentState.HOVERING) {
                this.state = ACC_ComponentState.IDLE;
                this.on_hover_stop(this);
            }
        }
        return detected;
    };
}

class AutoCanvas {
    canvas: HTMLCanvasElement = wrap(document.createElement('canvas'))
        .set('className', 'autoCanvas')
        .pipe(document.body.appendChild.bind(document.body))
        .unwrap();
    ctx: CanvasRenderingContext2D = wrap(this.canvas.getContext('2d'))
        .unwrap();
    components: ACC_Component[] = [];
    mouse_state: MouseStateType = {
        pressed: false,
        pressed_x: 0,
        pressed_y: 0,
        x: 0,
        y: 0
    };
    transform: TransformStateType = {
        scale: 1,
        x: 240,
        y: 1970,
        buffered_x: 0,
        buffered_y: 0
    };
    render_loop_pid: number;
    debug_flag: boolean = true;

    /* FPS Manipulation */
    _target_fps: number = 60;
    get target_fps() {return this._target_fps;}
    set target_fps(value: number) {
        this._target_fps = value;
        clearInterval(this.render_loop_pid);
        this.render_loop_pid = setInterval(this.refresh.bind(this), 1000 / this.target_fps);
    }
    render_time: number = 0;

    constructor() {
        this.correctDimensions();
        this.registerEventListeners();

        this.render_loop_pid = setInterval(this.refresh.bind(this), 1000 / this.target_fps);
    }

    registerEventListeners() {
        window.addEventListener('resize', () => {
            this.correctDimensions();
        });
        
        this.canvas.addEventListener("mousedown", (event) => {
            this.mouse_state.pressed = true;
            this.mouse_state.pressed_x = event.x;
            this.mouse_state.pressed_y = event.y;
            this.transform.buffered_x = this.transform.x;
            this.transform.buffered_y = this.transform.y;
        });

        document.addEventListener("mousemove", (event) => {
            this.mouse_state.x = event.x; // Potentially unneeded
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

        document.addEventListener("mouseup", (event) => {
            if (this.mouse_state.pressed) {
                this.mouse_state.pressed = false;
            }
        });

        window.addEventListener("resize", (event) => {
            this.refresh();
        });

        this.canvas.addEventListener("wheel", (event) => {
            this.zoom(event.deltaY, event.x, event.y);
        });
    }

    zoom(amount: number, about_x: number, about_y: number) {
        const SCALE_STRENGTH = 1.0005, SCALE_MIN = 0.1, SCALE_MAX = 15;
        const SCALE_AMT_MAX = SCALE_MAX / this.transform.scale, SCALE_AMT_MIN = SCALE_MIN / this.transform.scale;

        let scaleAmount = Math.pow(SCALE_STRENGTH, -amount);
        scaleAmount = Math.max(Math.min(scaleAmount, SCALE_AMT_MAX), SCALE_AMT_MIN);

        this.transform.scale *= scaleAmount;
        this.transform.scale = Math.max(Math.min(this.transform.scale, SCALE_MAX), SCALE_MIN);
        this.transform.x = (this.transform.x) * scaleAmount - about_x * (scaleAmount-1);
        this.transform.y = (this.transform.y) * scaleAmount - about_y * (scaleAmount-1);
    }

    correctDimensions(): void {
        let ctx: DOMRect = this.canvas.getBoundingClientRect();
        this.canvas.width = ctx.width;
        this.canvas.height = ctx.height;
        this.ctx.imageSmoothingEnabled = false;
    }

    addComponent(component: ACC_Component): void {
        this.components.push(component);
    }

    refresh() {
        let perf_start: number = performance.now();

        for (const component of this.components) {
            component.tick(1000 / this.target_fps);
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        }
    }
}