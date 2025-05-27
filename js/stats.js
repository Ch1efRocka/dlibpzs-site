document.addEventListener("DOMContentLoaded", () => {
    const statsSection = document.querySelector("#stats");

    const endpoints = [
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=relics_percent&min=0.1",
            title: "🔮 Искатели реликвий",
            type: "relics_percent"
        },
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=bricks_cnt&max=999",
            title: "🧱 Камень к камню",
            type: "bricks_cnt"
        },
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=wood_cnt&max=999",
            title: "🌳 Дровосеки до 100%",
            type: "wood_cnt"
        },
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=wood_cnt",
            title: "🌳 Главные дровосеки леса",
            type: "wood_cnt"
        },
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=ark&max=1999",
            title: "🛳️ Мореходы",
            type: "ark"
        },
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=words",
            title: "📚 Писатели",
            type: "words"
        },
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=souls_percent&max=99.9&min=0.1",
            title: "👻 Душеловцы",
            type: "souls_percent"
        },
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=savings&max=29999999",
            title: "💰 Будущие лавочники",
            type: "savings"
        },
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=t_level&min=1",
            title: "🛒 Базарные боги",
            type: "t_level"
        },
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=arena&min=0.1",
            title: "🏟️ Звезды Колизея",
            type: "arena"
        },
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=boss",
            title: "👹 Охотники на боссов",
            type: "boss"
        },
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=pet",
            title: "🐾 ПитомцеВеды",
            type: "pet"
        },
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=level",
            title: "🎓 Олимп сильнейших борцов со здравым смыслом",
            type: "level"
        },
        {
            url: "https://ch1efrocka.ru/api/stats/resources?type=alignment",
            title: "⚖️ Стражи добродетели",
            type: "alignment"
        }
    ];

    const filterInput = document.createElement("input");
    filterInput.type = "text";
    filterInput.placeholder = "🔍 Найти бога или нескольких: Имя1+Имя2";
    filterInput.className = "filter-input";
    statsSection.before(filterInput);

    let dateShown = false;

    Promise.all(endpoints.map(ep =>
        fetch(ep.url)
            .then(r => r.json())
            .then(json => ({ json, meta: ep }))
    ))
        .then(results => {
            results.forEach(({ json, meta }) => {
                if (!dateShown && json.date) {
                    const d = json.date.replace("stats_", "").replace(".json", "");
                    const p = document.createElement("p");
                    p.className = "stats-date";
                    p.textContent = `📆 Данные актуальны на ${d}`;
                    statsSection.prepend(p);
                    dateShown = true;
                }
                renderBlock(json.data, meta);
            });
        })
        .catch(console.error);

    function renderBlock(data, { title, type }) {
        const container = document.createElement("div");
        container.className = "stat-block fancy";
        container.innerHTML = `<h3>${title}</h3>`;

        const list = document.createElement("ol");
        list.className = "stat-list";

        // найдём максимум для нормализации полос
        let maxVal = 0;
        if (data.length) {
            if (type === "level") maxVal = data[0].level;
            if (type === "arena") maxVal = data[0].rating;
            if (type === "t_level") maxVal = data[0].t_level;
            if (type === "boss") maxVal = data[0].boss_power;
            if (type === "pet") maxVal = data[0].pet.pet_level;
        }

        data.forEach((item, i) => {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
            let pct = "0.0", metaHTML = "", valueHTML = "";

            switch (type) {
                case "relics_percent":
                    // берем ровно то значение, что пришло из API
                    pct = item.value;
                    valueHTML = `<span class="value">${pct}%</span>`;
                    break;
                case "ark":
                    pct = ((item.ark_total / 2000) * 100).toFixed(1);
                    metaHTML = `<span class="meta">W:${item.ark_m} / F:${item.ark_f}</span>`;
                    valueHTML = `<span class="value">${pct}%</span>`;
                    break;
                case "souls_percent":
                    pct = item.value.toFixed(1);
                    valueHTML = `<span class="value">${pct}%</span>`;
                    break;
                case "savings":
                    pct = ((item.value / 30000000) * 100).toFixed(1);
                    valueHTML = `<span class="value">${item.value.toLocaleString()}</span>`;
                    break;
                case "t_level":
                    pct = maxVal ? ((item.t_level / maxVal) * 100).toFixed(1) : "0.0";
                    metaHTML = `<span class="meta">${item.shop_name}</span>`;
                    valueHTML = `<span class="value">${item.t_level}</span>`;
                    break;
                case "arena":
                    pct = maxVal ? ((item.rating / maxVal) * 100).toFixed(1) : "0.0";
                    metaHTML = `<span class="meta">W:${item.won} / L:${item.lost}</span>`;
                    valueHTML = `<span class="value">${item.rating}</span>`;
                    break;
                case "boss":
                    pct = maxVal ? ((item.boss_power / maxVal) * 100).toFixed(1) : "0.0";
                    metaHTML = `<span class="meta">${item.boss_name}</span>`;
                    valueHTML = `<span class="value">${item.boss_power}</span>`;
                    break;
                case "pet":
                    pct = maxVal ? ((item.pet.pet_level / maxVal) * 100).toFixed(1) : "0.0";
                    metaHTML = `<span class="meta">${item.pet.pet_name} (${item.pet.pet_class})</span>`;
                    valueHTML = `<span class="value">${item.pet.pet_level}</span>`;
                    break;
                case "level":
                    pct = maxVal ? ((item.level / maxVal) * 100).toFixed(1) : "0.0";
                    metaHTML = `<span class="meta">🎒${item.inventory_capacity}  ❤️${item.max_health}</span>`;
                    valueHTML = `<span class="value">Lvl ${item.level}</span>`;
                    break;
                case "alignment":
                    // всегда 100%, текст без %
                    pct = "100.0";
                    valueHTML = `<span class="value">${item.value}</span>`;
                    break;
                default:
                    pct = (item.value / 10).toFixed(1);
                    valueHTML = `<span class="value">${pct}%</span>`;
            }

            const li = document.createElement("li");
            li.innerHTML = `
                <div class="stat-card">
                    <span class="rank">${medal}</span>
                    <span class="name">${item.godname}</span>
                    ${metaHTML}
                    ${valueHTML}
                </div>
                <div class="stat-bar">
                    <div class="fill" style="width:${pct}%"></div>
                </div>
            `;
            if (i >= 5) {
                li.classList.add("hidden-entry");
                li.style.display = "none";
            }
            list.appendChild(li);
        });

        container.appendChild(list);

        if (data.length > 5) {
            const btn = document.createElement("button");
            btn.className = "show-more-button";
            btn.textContent = "Показать ещё";
            let exp = false;
            btn.addEventListener("click", () => {
                container.querySelectorAll(".hidden-entry").forEach(el => {
                    el.style.display = exp ? "none" : "list-item";
                });
                exp = !exp;
                btn.textContent = exp ? "Скрыть" : "Показать ещё";
            });
            container.appendChild(btn);
        }

        statsSection.appendChild(container);

        filterInput.addEventListener("input", () => {
            const raw = filterInput.value.toLowerCase().trim();
            // разбиваем по плюсу, убираем пустые
            const terms = raw
                .split(/\s*\+\s*/g)
                .map(t => t.trim())
                .filter(t => t.length > 0);

            list.querySelectorAll("li").forEach(li => {
                const name = li.querySelector(".name").textContent.toLowerCase();
                // если нет терминов — показываем всё,
                // иначе — показываем, если хоть один термин входит в имя
                const ok =
                    terms.length === 0 ||
                    terms.some(term => name.includes(term));
                li.style.display = ok ? "list-item" : "none";
            });
        });
    }
});