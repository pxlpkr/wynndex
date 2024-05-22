const parse_rewards_requirements = (data: JSON_Content_Item) => {
    let o = fast("div");
    if (data.requirements.quests.length > 0 || Object.keys(data.requirements.professionLevels).length > 0) {
        let l = fast("label", {innerText: 'Requirements:', className: "ui-label broad-text small-text"});
        for (const quest of data.requirements.quests) {
            l.appendChild(fast("br"));
            l.appendChild(fast("img", {src: "rsc/frame_quest_a.png", className: "tiny-icon"}));
            l.innerHTML += quest;
        }
        for (const [prof, level] of Object.entries(data.requirements.professionLevels)) {
            l.appendChild(fast("br"));
            l.appendChild(fast("img", {src: `rsc/prof_${prof}.png`, className: "tiny-icon"}));
            l.innerHTML += `${prof.charAt(0).toUpperCase()}${prof.slice(1)} ${level}`;
        }
        o.appendChild(l);
    }
    if (data.rewards.length > 0) {
        let l = fast("label", {innerText: 'Rewards:', className: "ui-label broad-text small-text"});
        for (const reward of data.rewards) {
            l.appendChild(fast("br"));
            let s = reward.split(' ');
            if (s.length > 1 && ["Fishing", "Farming", "Woodcutting", "Mining"].includes(s[1])) {
                l.appendChild(fast("img", {src: `rsc/prof_${s[1].toLowerCase()}_xp.png`, className: "tiny-icon"}));
            } else if (s.length > 1 && s[1] == "XP" || s[1] == "Combat") {
                l.appendChild(fast("img", {src: `rsc/xp.png`, className: "tiny-icon"}));
            } else if (s.length > 1 && s[1] == "Emeralds") {
                let count = parseInt(s[0]);
                if (count < 64 * 8) {
                    l.appendChild(fast("img", {src: `rsc/emerald.png`, className: "tiny-icon"}));
                } else if (count < 64 * 64) {
                    l.appendChild(fast("img", {src: `rsc/emerald_block.png`, className: "tiny-icon"}));
                } else {
                    l.appendChild(fast("img", {src: `rsc/emerald_liquid.png`, className: "tiny-icon"}));
                }
            } else if (s.length > 0 && s[s.length - 1] == "Key") {
                l.appendChild(fast("img", {src: `rsc/key.png`, className: "tiny-icon"}));
            } else if (s.length > 0 && s[0] == "Access") {
                l.appendChild(fast("img", {src: `rsc/unlocked.png`, className: "tiny-icon"}));
            } else {
                l.appendChild(fast("img", {src: `rsc/empty.png`, className: "tiny-icon"}));
            }

            l.innerHTML += reward;
        }
        o.appendChild(l);
    }
    return o;
}

function closest_match(filter: string, ignore: JSON_Content_Item[]): null | JSON_Content_Item {
    let max_score = -1;
    let best = null;
    for (const item of Object.values(content)) {
        if (ignore.includes(item)) {
            continue;
        }
        if (item.name.toLowerCase() == filter.toLowerCase()) {
            return item;
        }
        if (item.name.toLowerCase().startsWith(filter.toLowerCase()) && max_score < 5) {
            max_score = 5;
            best = item;
        } else if (item.name.toLowerCase().includes(filter.toLowerCase()) && max_score < 2) {
            max_score = 2;
            best = item;
        }
    }
    return best;
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
]

const generate_ui_opt_filter = (ui: UIPanel, _: null) => {
    let item_1 = fast("div", {className: "ui-container ui-padded"});
    item_1.style.minWidth = `${256+64}px`;
    item_1.appendChild(fast("label", {innerText: "Filters", className: "ui-label center-text ui-title"}));

    let images = [];
    for (const item of opt_filters) {
        let outer = fast("div", {className: "ui-subdiv"});
        let img_button = fast("img", {draggable: "false", className: "filter-img"});
        img_button.src = (options.view[item[1]] ? match_type_frame_a_url(item[1]) : match_type_frame_url(item[1]));
        images.push(img_button);
        let img_label = fast("label", {innerText: item[0], className: "ui-label opt_item"});
        img_button.addEventListener("contextmenu", () => {
            for (const opt of Object.keys(options.view)) {
                options.view[opt] = false;
            }
            for (let i = 0; i < opt_filters.length; i++) {
                images[i].src = match_type_frame_url(opt_filters[i][1]);
            }
            img_button.src = match_type_frame_a_url(item[1]);
            options.view[item[1]] = true;
        })
        img_button.addEventListener("click", () => {
            if (options.view[item[1]]) {
                img_button.src = match_type_frame_url(item[1]);
            } else {
                img_button.src = match_type_frame_a_url(item[1]);
            }
            options.view[item[1]] = !options.view[item[1]];
        });
        outer.appendChild(img_button);
        outer.appendChild(img_label);
        item_1.appendChild(outer);
    }

    item_1.appendChild(fast("hr", {className: "ui-separator"}));

    // Search results
    let search_elements = [[], [], []];
    let search_results = fast("div", {className: "ui-subdiv", style: "display: table"});
    for (let i = 0; i < 3; i++) {
        let inner = fast("div", {className: "ui-subdiv", style: "margin-top: 8px; display: flex"});
        search_elements[i].push(fast("img", {src: "rsc/empty.png", className: "filter-result-img"}));
        search_elements[i].push(fast("label", {className: "ui-label opt_item", style: "line-height: 80%; font-size: 22px !important"}));
        inner.appendChild(search_elements[i][0]);
        inner.appendChild(search_elements[i][1]);
        search_results.appendChild(inner);
    }

    // Search bar
    let search_bar = fast("input", {type: "text", className: "filter-search-bar", placeholder: "Search", value: options.filter});
    search_bar.addEventListener("input", () => {
        options.filter = search_bar.value;
        if (search_bar.value.length == 0) {
            item_1.removeChild(search_results);
        } else if (!item_1.contains(search_results)) {
            item_1.appendChild(search_results);
        }

        let matches: JSON_Content_Item[] = [];
        for (let i = 0; i < 3; i++) {
            matches.splice(0, 0, closest_match(search_bar.value, matches));
            if (matches[0] == null) {
                search_elements[i][0].src = "rsc/empty.png";
                search_elements[i][1].innerText = "";
                continue;
            }
            search_elements[i][0].src = match_type_frame_a_url(matches[0].type);
            search_elements[i][1].innerText = matches[0].name;
            search_elements[i][1].appendChild(fast("br"));
            search_elements[i][1].innerText += `Level ${matches[0].requirements.level}`;
        }

        Object.values(content);
    });
    item_1.appendChild(search_bar);

    ui.getContent().appendChild(item_1);
};

const generate_ui_cave = (ui: UIPanel, data: JSON_Content_Item) => {
   let container = fast("div", {className: "ui-container ui-padded", children: [
        fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
        fast("label", {innerText: `Level ${data.requirements.level} ${data.specialInfo ? data.specialInfo : data.type}`, className: "ui-label center-text broad-text ui-subtitle"}),
        fast("hr", {className: "ui-separator"}),
        fast("label", {innerText: `Length: ${data.length} (${data.lengthInfo})`, className: "ui-label small-text"}),
        fast("label", {innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text"}),
    ]});
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};

const generate_ui_bossaltar = (ui: UIPanel, data: JSON_Content_Item) => {
    let container = fast("div", {className: "ui-container ui-padded", children: [
        fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
        fast("label", {innerText: `Level ${data.requirements.level} Boss Altar`, className: "ui-label center-text broad-text ui-subtitle"}),
        fast("hr", {className: "ui-separator"})
    ]})
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};

const generate_ui_quest = (ui: UIPanel, data: JSON_Content_Item) => {
    let container = fast("div", {className: "ui-container ui-padded", children: [
        fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
        fast("label", {innerText: `Level ${data.requirements.level} ${data.type == 'storylineQuest' ? 'Storyline ' : ''}Quest${data.specialInfo != 'Storyline' ? '\n' + data.specialInfo : ''}`, className: "ui-label center-text broad-text ui-subtitle"}),
        fast("hr", {className: "ui-separator"}),
        fast("label", {innerText: `Length: ${data.length}`, className: "ui-label small-text"}),
        fast("label", {innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text"}),
    ]});
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};

const generate_ui_secret_discovery = (ui: UIPanel, data: JSON_Content_Item) => {
    let container = fast("div", {className: "ui-container ui-padded", children: [
        fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
        fast("label", {innerText: `Level ${data.requirements.level} Secret Discovery`, className: "ui-label center-text broad-text ui-subtitle"}),
        fast("hr", {className: "ui-separator"}),
        fast("label", {innerText: `Region: ${data.specialInfo}`, className: "ui-label small-text"}),
    ]});
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};

const generate_ui_world_discovery = (ui: UIPanel, data: JSON_Content_Item) => {
    let container = fast("div", {className: "ui-container ui-padded", children: [
        fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
        fast("label", {innerText: `Level ${data.requirements.level} World Discovery`, className: "ui-label center-text broad-text ui-subtitle"}),
        fast("hr", {className: "ui-separator"}),
    ]});
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};

const generate_ui_territorial_discovery = (ui: UIPanel, data: JSON_Content_Item) => {
    let container = fast("div", {className: "ui-container ui-padded", children: [
        fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
        fast("label", {innerText: `Level ${data.requirements.level} Territory`, className: "ui-label center-text broad-text ui-subtitle"}),
        fast("hr", {className: "ui-separator"}),
    ]});
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};

const generate_ui_lootrun = (ui: UIPanel, data: JSON_Content_Item) => {
    let container = fast("div", {className: "ui-container ui-padded", children: [
        fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
        fast("label", {innerText: `Level ${data.requirements.level} Lootrun Camp`, className: "ui-label center-text broad-text ui-subtitle"}),
        fast("hr", {className: "ui-separator"}),
        fast("label", {innerText: `Length: ${data.length}`, className: "ui-label small-text"}),
        fast("label", {innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text"}),
    ]});
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};

const generate_ui_raid = (ui: UIPanel, data: JSON_Content_Item) => {
    let container = fast("div", {className: "ui-container ui-padded", children: [
        fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
        fast("label", {innerText: `Level ${data.requirements.level} Raid`, className: "ui-label center-text broad-text ui-subtitle"}),
        fast("hr", {className: "ui-separator"}),
        fast("label", {innerText: `Length: ${data.length}`, className: "ui-label small-text"}),
        fast("label", {innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text"}),
    ]});
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};

const generate_ui_miniquest = (ui: UIPanel, data: JSON_Content_Item) => {
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
    container.appendChild(fast("label", {innerText: `Length: ${data.length}`, className: "ui-label small-text"}));
    container.appendChild(fast("label", {innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text"}));
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};

const generate_ui_dungeon = (ui: UIPanel, data: JSON_Content_Item) => {
    let container = fast("div", {className: "ui-container ui-padded", children: [
        fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
        fast("label", {innerText: `Level ${data.requirements.level} Dungeon`, className: "ui-label center-text broad-text ui-subtitle"}),
        fast("hr", {className: "ui-separator"}),
        fast("label", {innerText: `Length: ${data.length}`, className: "ui-label small-text"}),
        fast("label", {innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text"}),
    ]});
    container.appendChild(parse_rewards_requirements(data));
    ui.getContent().appendChild(container);
};