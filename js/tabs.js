(function () {
  const App = (window.App = window.App || {});

  App.initTabs = function initTabs() {
    const tabs = [...document.querySelectorAll(".tab")];
    const panels = [...document.querySelectorAll(".tab-panel")];

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const nextTab = tab.dataset.tab;

        tabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-selected", String(active));
        });

        panels.forEach((panel) => {
          const active = panel.dataset.panel === nextTab;
          panel.classList.toggle("is-active", active);
          panel.hidden = !active;
        });
      });
    });
  };
})();
