const parse_profession_levels = (inp) => {
    let out: string[] = [];
    for (const [key, value] of Object.entries(inp)) {
        out.push(`${key} ${value}`);
    }
    return out;
}

const generate_ui_cave = (ui: UIPanel, data: JSON_Content_Item) => {
    ui.getContent().appendChild(
        fast("div", {className: "ui-container ui-padded", children: [
            fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
            fast("label", {innerText: `Level ${data.requirements.level} ${data.specialInfo ? data.specialInfo : data.type}`, className: "ui-label center-text broad-text ui-subtitle"}),
            fast("hr", {className: "ui-separator"}),
            fast("label", {innerText: `Length: ${data.length} (${data.lengthInfo})`, className: "ui-label small-text"}),
            fast("label", {innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text"}),
            fast("label", {innerText: `rewards: \n+ ${data.rewards.join("\n+ ")}`, className: "ui-label broad-text small-text"}),
        ]})
    );
};

const generate_ui_quest = (ui: UIPanel, data: JSON_Content_Item) => {
    let container = fast("div", {className: "ui-container ui-padded", children: [
        fast("label", {innerText: data.name, className: "ui-label center-text ui-title"}),
        fast("label", {innerText: `Level ${data.requirements.level} ${data.type == 'storylineQuest' ? 'Storyline ' : ''}Quest${data.specialInfo != 'Storyline' ? '\n' + data.specialInfo : ''}`, className: "ui-label center-text broad-text ui-subtitle"}),
        fast("hr", {className: "ui-separator"}),
        fast("label", {innerText: `Length: ${data.length}`, className: "ui-label small-text"}),
        fast("label", {innerText: `Difficulty: ${data.difficulty}`, className: "ui-label broad-text small-text"}),
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
    container.appendChild(fast("label", {innerText: `Rewards: \n+ ${data.rewards.join("\n+ ")}`, className: "ui-label broad-text small-text"}));
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
    if (data.requirements.quests.length > 0 || Object.keys(data.requirements.professionLevels).length > 0) {
        container.appendChild(fast("label", {innerText: (`Requirements:` + 
        (data.requirements.quests.length > 0 ? `\n- ${data.requirements.quests.join("\n- ")}` : '') +
        (Object.keys(data.requirements.professionLevels).length > 0 ? `\n- ${parse_profession_levels(data.requirements.professionLevels).join("\n- ")}` : '')),
        className: "ui-label broad-text small-text"}))
    }
    container.appendChild(fast("label", {innerText: `Rewards: \n+ ${data.rewards.join("\n+ ")}`, className: "ui-label broad-text small-text"}));
    ui.getContent().appendChild(container);
};