type HTMLAnyElement<T> = 
    T extends "div" ? HTMLDivElement :
    T extends "button" ? HTMLButtonElement :
    T extends "input" ? HTMLInputElement :
    T extends "label" ? HTMLLabelElement :
    HTMLElement;

function appendChildren(parent: HTMLElement, ...children: HTMLElement[]) {
    for (const element of children) {
        parent.appendChild(element);
    }
}

function fast<T extends string>(tag: T, args: {[key: string]: any} = {}): HTMLAnyElement<T> {
    let element = document.createElement(tag);
    for (const [key, value] of Object.entries(args)) {
        if (key == "children") {
            appendChildren(element, ...value);
        } else {
            element[key] = value;
        }
    }
    return element as HTMLAnyElement<T>;
}

class Returnable<T> {
    public value: T;
};

type GenerateOptions = {
    type: string,
    generator: (ui: UIPanel, opts: {[key: string]: any}) => void,
    tab?: string,
    data: {[key: string]: any}
};

type UIPanelConstructionType = {
    include_close?: boolean,
    include_navigation?: boolean,
    allow_dragging?: boolean,
    unique_id?: string,
    generator: GenerateOptions,
    at?: [number, number]
}

class UIPanel {
    private panel: HTMLDivElement;
    private bar: HTMLDivElement;
    private tabs: HTMLDivElement;
    private content: HTMLDivElement;

    private nav_left: HTMLButtonElement;
    private nav_right: HTMLButtonElement;

    private history_past: GenerateOptions[];
    public history_present: GenerateOptions;
    private history_future: GenerateOptions[];
  
    private resize_bind: any;

    public static tryFetch(unique_id: string): null | UIPanel {
        let target = document.getElementById(unique_id);
        if (target == null)
            return null;

        let ctx = new Returnable<UIPanel>();
        target.dispatchEvent(new CustomEvent("ui-get", {'detail': ctx}));
        return ctx.value;
    }

    constructor(args: UIPanelConstructionType) {
        /* Check for unique duplicates */
        if (args.unique_id && document.getElementById(args.unique_id) != null) {
            return;
        }

        /* Building Panel */
        this.panel = fast("div", {className: "ui-panel initial-fade"});
        if (args.unique_id) {
            this.panel.id = args.unique_id;
        }

        /* Building Navigation Bar */
        this.bar = fast("div", {className: "ui-move-bar"});

        if (args.include_close) {
            let button_close = fast("button", {className: "ui-nav-button ui-close"});
            button_close.addEventListener('click', this.dispose.bind(this));
            this.bar.appendChild(button_close);
        }

        if (args.include_navigation) {
            this.nav_left = fast("button", {className: "ui-nav-button ui-left ui-inactive"});
            this.bar.appendChild(this.nav_left);
            this.nav_left.addEventListener('click', this.navigateLeft.bind(this));
            this.nav_right = fast("button", {className: "ui-nav-button ui-right ui-inactive"});
            this.bar.appendChild(this.nav_right);
            this.nav_right.addEventListener('click', this.navigateRight.bind(this));
        }

        this.panel.addEventListener('mousedown', (e: MouseEvent) => {
            this.panel.classList.remove('initial-fade');
            this.panel.parentNode.appendChild(this.panel);
        })

        if (args.allow_dragging) {
            this.bar.addEventListener('mousedown', (e: MouseEvent) => {
                var x = e.clientX, y = e.clientY;
                var panel_x = this.panel.offsetLeft, panel_y = this.panel.offsetTop;

                function on_mouse_up(e: MouseEvent) {
                    document.removeEventListener('mouseup', on_mouse_up_bind);
                    document.removeEventListener('mousemove', on_mouse_move_bind);
                }

                function on_mouse_move(e: MouseEvent) {
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

        /* Building Tabs Bar */
        this.tabs = fast("div", {className: "ui-tabs"});

        /* Building Content */
        this.content = fast("div", {className: "ui-content"});

        /* Events */
        this.panel.addEventListener('ui-kill', this.dispose.bind(this));
        this.panel.addEventListener('ui-get', (e: CustomEvent) => {
            e.detail['value'] = this;
        });
        this.resize_bind = this.updateContentSize.bind(this);
        window.addEventListener("resize", this.resize_bind);

        /* Cleaning up */
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

    public generate(generator: GenerateOptions) {
        this.wipeContent();
        this.wipeTabs();
        this.history_present = generator;

        generator.generator(this, generator.data);
    }

    public updateContentSize(e?: UIEvent) {
        this.panel.style.top = `${Math.max(Math.min(this.panel.offsetTop, window.innerHeight-32), 0)}px`;
        this.panel.style.left = `${Math.max(Math.min(this.panel.offsetLeft, window.innerWidth-96), -this.panel.clientWidth+64)}px`;
        this.content.style.maxHeight = `${window.innerHeight - this.content.getBoundingClientRect().y}px`;
    }

    public dispose(e?: MouseEvent) {
        window.removeEventListener("resize", this.resize_bind);
        this.panel.classList.add('is-fading-out');
        setTimeout((() => {document.body.removeChild(this.panel)}).bind(this), 150);
    }

    // private _G_InfoBox(generate_args: {type: string, tab?: string, data: {[key: string]: any}}) {
    //     this.wipeContent();
    //     this.wipeTabs();

    //     this.history_present = generate_args;
    // }

    private createTabs(...args: string[]) {
        let tab_row = fast("div", {className: "ui-tabs-row"});
        for (const item of args)
            tab_row.appendChild(fast("label", {innerText: item, className: "ui-tab", onclick: this.navigateTab.bind(this, item)}));
        this.tabs.appendChild(tab_row);
    }

    private navigateTab(destination: string) {
        let copy: typeof this.history_present;
        Object.assign(copy, this.history_present);
        copy.tab = destination;
        this.navigateTo(copy);
    }

    private navigateLeft() {
        if (this.history_past.length == 0)
            return;

        this.history_future.unshift(this.history_present);
        this.generate(this.history_past.pop());

        if (this.history_past.length == 0)
            this.nav_left.classList.add('ui-inactive');

        if (this.history_future.length == 1)
            this.nav_right.classList.remove('ui-inactive');
    }

    private navigateRight() {
        if (this.history_future.length == 0)
            return;

        this.history_past.push(this.history_present);
        this.generate(this.history_future.shift());

        if (this.history_past.length == 1)
            this.nav_left.classList.remove('ui-inactive');

        if (this.history_future.length == 0)
            this.nav_right.classList.add('ui-inactive');
    }

    private navigateTo(destination: GenerateOptions, e?: MouseEvent) {
        if (e) {
            e.preventDefault();

            if (e.shiftKey) {
                new UIPanel({
                    include_close: true,
                    include_navigation: true,
                    generator: destination,
                    at: [this.panel.offsetLeft+20, this.panel.offsetTop+20]
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
    
    private wipeContent() {
        this.content.textContent = "";
    }

    private wipeTabs() {
        this.tabs.textContent = "";
    }

    public getContent() {
        return this.content;
    }
}