
document.addEventListener("DOMContentLoaded", () => {
    const statsSection = document.querySelector("#stats");

    const endpoints = [
        {
            url: "http://46.17.106.198:5000/api/stats/resources?type=bricks_cnt&max=999",
            title: "🧱 Наши новички - каменщики"
        },
        {
            url: "http://46.17.106.198:5000/api/stats/resources?type=wood_cnt&max=999",
            title: "🌳 Дровосеки до 100%"
        },
        {
            url: "http://46.17.106.198:5000/api/stats/resources?type=wood_cnt",
            title: "🌳 Главные дровосеки леса"
        }
    ];

    const filterInput = document.createElement("input");
    filterInput.type = "text";
    filterInput.placeholder = "🔍 Найти героя...";
    filterInput.className = "filter-input";
    statsSection.before(filterInput);

    let statsDateDisplayed = false;

    Promise.all(endpoints.map(({ url }) => fetch(url).then(res => res.json())))
        .then(results => {
            results.forEach((json, i) => {
                const { title } = endpoints[i];

                // дата только один раз
                if (!statsDateDisplayed && json.date) {
                    const parsedDate = json.date.replace("stats_", "").replace(".json", "");
                    const dateNote = document.createElement("p");
                    dateNote.className = "stats-date";
                    dateNote.textContent = `📆 Данные актуальны на ${parsedDate}`;
                    statsSection.prepend(dateNote);
                    statsDateDisplayed = true;
                }

                renderStatBlock(json.data, title);
            });
        })
        .catch(err => console.error("Ошибка загрузки статистики:", err));

    function renderStatBlock(data, title) {
        const container = document.createElement("div");
        container.className = "stat-block fancy";

        const heading = document.createElement("h3");
        heading.textContent = title;
        container.appendChild(heading);

        const list = document.createElement("ol");
        list.className = "stat-list";

        data.forEach((item, index) => {
            const li = document.createElement("li");

            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
            const percent = (item.value / 10).toFixed(1);

            li.innerHTML = `
        <div class="stat-card">
          <span class="rank">${medal}</span>
          <span class="name">${item.godname}</span>
          <span class="value">${percent}%</span>
        </div>
        <div class="stat-bar"><div class="fill" style="width: ${percent}%"></div></div>
      `;

            if (index >= 5) {
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

            let expanded = false;
            btn.addEventListener("click", () => {
                const hidden = container.querySelectorAll(".hidden-entry");
                expanded = !expanded;

                hidden.forEach(el => {
                    el.style.display = expanded ? "list-item" : "none";
                });

                btn.textContent = expanded ? "Скрыть" : "Показать ещё";
            });

            container.appendChild(btn);
        }

        statsSection.appendChild(container);

        filterInput.addEventListener("input", () => {
            const query = filterInput.value.toLowerCase();
            list.querySelectorAll("li").forEach(li => {
                const name = li.querySelector(".name").textContent.toLowerCase();
                li.style.display = name.includes(query) || query === "" ? "list-item" : "none";
            });
        });
    }
});
