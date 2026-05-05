(function () {
  const App = (window.App = window.App || {});
  const { classifyLuckyOutcome } = App.outcomes;
  const {
    binomialProbability,
    formatPercent,
    log10BinomialProbability,
    oneIn,
    percent,
    tailBinomialMode,
  } = App.probability;

  App.initBloodstone = function initBloodstone() {
    const form = document.querySelector("#bloodstone-form");
    const probabilityNode = document.querySelector("#bloodstone-probability");
    const rarityNode = document.querySelector("#bloodstone-rarity");
    const summaryNode = document.querySelector("#bloodstone-summary");
    const breakdownNode = document.querySelector("#bloodstone-breakdown");
    const formulaNode = document.querySelector("#bloodstone-formula");
    const errorNode = document.querySelector("#bloodstone-error-message");

    function setResultTone(status) {
      probabilityNode.className = `value ${status}`;
      rarityNode.className = `value ${status}`;
    }

    function showError(message) {
      errorNode.hidden = false;
      errorNode.textContent = message;
    }

    function clearError() {
      errorNode.hidden = true;
      errorNode.textContent = "";
    }

    function readValues() {
      const data = new FormData(form);

      return {
        triggers: Number(data.get("triggers")),
        hits: Number(data.get("hits")),
        useAtLeast: data.get("useAtLeast") === "on",
      };
    }

    function validate({ triggers, hits }) {
      if (![triggers, hits].every(Number.isInteger)) {
        return "Use whole numbers for triggers and Bloodstone hits.";
      }

      if (triggers < 0) {
        return "Triggers cannot be negative.";
      }

      if (hits < 0 || hits > triggers) {
        return "Bloodstone hits must be between 0 and the trigger count.";
      }

      return null;
    }

    function render(values) {
      const validationError = validate(values);

      if (validationError) {
        showError(validationError);
        return;
      }

      clearError();

      const hitChance = 0.5;
      const tailMode = values.useAtLeast
        ? tailBinomialMode(values.triggers, values.hits, hitChance)
        : null;
      const probability = values.useAtLeast
        ? tailMode.probability
        : binomialProbability(values.triggers, values.hits, hitChance);
      const log10Probability = values.useAtLeast
        ? tailMode.log10Probability
        : log10BinomialProbability(values.triggers, values.hits, hitChance);
      const outcome = classifyLuckyOutcome(probability);

      probabilityNode.textContent = formatPercent(probability, log10Probability);
      rarityNode.textContent = oneIn(probability, log10Probability);
      summaryNode.textContent = outcome.text;
      breakdownNode.textContent = values.useAtLeast
        ? `Using auto tail odds for ${tailMode.direction} ${values.hits}/${values.triggers} Bloodstone hits at a fixed ${percent(
          hitChance,
        )} hit chance per trigger. Expected hits: ${tailMode.expectedHits.toFixed(2)}.`
        : `Using exact-hit odds for ${values.hits}/${values.triggers} Bloodstone hits at a fixed ${percent(
          hitChance,
        )} hit chance per trigger.`;
      formulaNode.textContent = values.useAtLeast
        ? "Auto tail mode uses a binomial tail with p = 0.5: sum from k = 0 to observed hits of C(n, k) (0.5)^k (0.5)^(n-k) for low outcomes, or sum from k = observed hits to n for high outcomes."
        : "Exact mode uses binomial odds with p = 0.5: C(n, k) (0.5)^k (0.5)^(n-k).";
      setResultTone(outcome.status);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render(readValues());
    });

    form.addEventListener("input", () => {
      render(readValues());
    });

    render(readValues());
  };
})();
