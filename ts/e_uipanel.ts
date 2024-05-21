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
            if (["Fishing", "Farming", "Woodcutting", "Mining"].includes(s[1])) {
                l.appendChild(fast("img", {src: `rsc/prof_${s[1].toLowerCase()}_xp.png`, className: "tiny-icon"}));
            } else if (s[1] == "XP" || s[1] == "Combat") {
                l.appendChild(fast("img", {src: `rsc/xp.png`, className: "tiny-icon"}));
            } else if (s[1] == "Emeralds") {
                let count = parseInt(s[0]);
                if (count < 64 * 8) {
                    l.appendChild(fast("img", {src: `rsc/emerald.png`, className: "tiny-icon"}));
                } else if (count < 64 * 64) {
                    l.appendChild(fast("img", {src: `rsc/emerald_block.png`, className: "tiny-icon"}));
                } else {
                    l.appendChild(fast("img", {src: `rsc/emerald_liquid.png`, className: "tiny-icon"}));
                }
            } else {
                l.appendChild(fast("img", {src: `rsc/empty.png`, className: "tiny-icon"}));
            }

            l.innerHTML += reward;
        }
        o.appendChild(l);
    }
    return o;
}

const opt_filters = [
    ["Quests", "quest", "rsc/frame_quest_a.png", "rsc/frame_quest.png"],
    ["Mini-Quests", "miniQuest", "rsc/frame_miniquest_a.png", "rsc/frame_miniquest.png"],
    ["Caves", "cave", "rsc/frame_cave_a.png", "rsc/frame_cave.png"],
    ["Dungeons", "dungeon", "rsc/frame_dungeon_a.png", "rsc/frame_dungeon.png"],
    ["Raids", "raid", "rsc/frame_raid_a.png", "rsc/frame_raid.png"],
    ["Lootruns", "lootrunCamp", "rsc/frame_lootrun_a.png", "rsc/frame_lootrun.png"],
    ["Boss Altars", "bossAltar", "rsc/frame_boss_a.png", "rsc/frame_boss.png"],
    ["World Discoveries", "worldDiscovery", "rsc/frame_discovery_a.png", "rsc/frame_discovery.png"],
    ["Territorial Discoveries", "territorialDiscovery", "rsc/frame_discovery_a.png", "rsc/frame_discovery.png"],
    ["Secret Discoveries", "secretDiscovery", "rsc/frame_discovery_a.png", "rsc/frame_discovery.png"],
]

const generate_ui_opt_filter = (ui: UIPanel, _: null) => {
    let item_1 = fast("div", {className: "ui-container ui-padded"});
    item_1.style.minWidth = `${256+64}px`;
    item_1.appendChild(fast("label", {innerText: "Filters", className: "ui-label center-text ui-title"}));

    for (const item of opt_filters) {
        let outer = fast("div", {className: "ui-subdiv"});
        let img_button = fast("img", {className: "filter-img", src: (options.view[item[1]]? item[2] : item[3])});
        let img_label = fast("label", {innerText: item[0], className: "ui-label ui-subtitle"});
        img_button.addEventListener("click", () => {
            if (options.view[item[1]]) {
                img_button.src = item[3];
            } else {
                img_button.src = item[2];
            }
            options.view[item[1]] = !options.view[item[1]];
            updateVisibility();
        });
        outer.appendChild(img_button);
        outer.appendChild(img_label);
        item_1.appendChild(outer);
    }

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