(function () {
  const App = (window.App = window.App || {});
  const { classifyLuckyOutcome } = App.outcomes;
  const {
    binomialProbability,
    formatPercent,
    log10BinomialProbability,
    luckyRate,
    oneIn,
    percent,
    tailProbabilityMode,
  } = App.probability;

  App.initLuckyOdds = function initLuckyOdds() {
    const form = document.querySelector("#lucky-form");
    const probabilityNode = document.querySelector("#lucky-probability");
    const rarityNode = document.querySelector("#lucky-rarity");
    const summaryNode = document.querySelector("#lucky-summary");
    const breakdownNode = document.querySelector("#lucky-breakdown");
    const formulaNode = document.querySelector("#lucky-formula");
    const errorNode = document.querySelector("#lucky-error-message");
    const enableMultNode = document.querySelector("#enable-mult");
    const enableMoneyNode = document.querySelector("#enable-money");
    const multHitsNode = document.querySelector("#mult-hits");
    const moneyHitsNode = document.querySelector("#money-hits");

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
        enableMult: data.get("enableMult") === "on",
        multHits: Number(data.get("multHits")),
        enableMoney: data.get("enableMoney") === "on",
        moneyHits: Number(data.get("moneyHits")),
        diceCount: Number(data.get("diceCount")),
        useAtLeast: data.get("useAtLeast") === "on",
      };
    }

    function validate({ triggers, enableMult, multHits, enableMoney, moneyHits, diceCount }) {
      if (![triggers, multHits, moneyHits, diceCount].every(Number.isInteger)) {
        return "Use whole numbers for lucky triggers, hit counts, and dice.";
      }

      if (triggers < 0) {
        return "Lucky triggers cannot be negative.";
      }

      if (diceCount < 0) {
        return "Dice count cannot be negative.";
      }

      if (!enableMult && !enableMoney) {
        return "Enable mult, money, or both before analyzing.";
      }

      if (enableMult && (multHits < 0 || multHits > triggers)) {
        return "Mult hits must be between 0 and the trigger count.";
      }

      if (enableMoney && (moneyHits < 0 || moneyHits > triggers)) {
        return "Money hits must be between 0 and the trigger count.";
      }

      return null;
    }

    function syncInputs() {
      multHitsNode.disabled = !enableMultNode.checked;
      moneyHitsNode.disabled = !enableMoneyNode.checked;
    }

    function render(values) {
      const validationError = validate(values);

      if (validationError) {
        showError(validationError);
        return;
      }

      clearError();

      const multRate = luckyRate(5, values.diceCount);
      const moneyRate = luckyRate(15, values.diceCount);
      const modeLabel = values.useAtLeast ? "tail" : "exact";

      let probability = 1;
      let log10Probability = 0;
      const activeParts = [];

      if (values.enableMult) {
        const multMode = values.useAtLeast
          ? tailProbabilityMode(values.triggers, values.multHits, multRate.effectiveChance)
          : null;
        const multProbability = values.useAtLeast
          ? multMode.probability
          : binomialProbability(values.triggers, values.multHits, multRate.effectiveChance);
        const multLog10Probability = values.useAtLeast
          ? multMode.log10Probability
          : log10BinomialProbability(values.triggers, values.multHits, multRate.effectiveChance);

        probability *= multProbability;
        log10Probability += multLog10Probability;
        activeParts.push(
          `mult ${values.useAtLeast ? multMode.direction : modeLabel} ${values.multHits}/${
            values.triggers
          } at ${percent(multRate.rawChance)}${
            multRate.rawChance > 1 ? `, capped to ${percent(multRate.effectiveChance)}` : ""
          }${values.useAtLeast ? `, expected ${multMode.expectedHits.toFixed(2)}` : ""}`,
        );
      }

      if (values.enableMoney) {
        const moneyMode = values.useAtLeast
          ? tailProbabilityMode(values.triggers, values.moneyHits, moneyRate.effectiveChance)
          : null;
        const moneyProbability = values.useAtLeast
          ? moneyMode.probability
          : binomialProbability(values.triggers, values.moneyHits, moneyRate.effectiveChance);
        const moneyLog10Probability = values.useAtLeast
          ? moneyMode.log10Probability
          : log10BinomialProbability(values.triggers, values.moneyHits, moneyRate.effectiveChance);

        probability *= moneyProbability;
        log10Probability += moneyLog10Probability;
        activeParts.push(
          `money ${values.useAtLeast ? moneyMode.direction : modeLabel} ${values.moneyHits}/${
            values.triggers
          } at ${percent(moneyRate.rawChance)}${
            moneyRate.rawChance > 1 ? `, capped to ${percent(moneyRate.effectiveChance)}` : ""
          }${values.useAtLeast ? `, expected ${moneyMode.expectedHits.toFixed(2)}` : ""}`,
        );
      }

      const outcome = classifyLuckyOutcome(probability);

      probabilityNode.textContent = formatPercent(probability, log10Probability);
      rarityNode.textContent = oneIn(probability, log10Probability);
      summaryNode.textContent = outcome.text;
      breakdownNode.textContent = values.useAtLeast
        ? `Using auto tail odds for ${activeParts.join(
            " and ",
          )}. Low outcomes use at most; high outcomes use at least. Dice count ${
            values.diceCount
          } scales rates by 2^${values.diceCount}.`
        : `Using exact-hit odds for ${activeParts.join(" and ")}. Dice count ${
            values.diceCount
          } scales rates by 2^${values.diceCount}.`;
      formulaNode.textContent = values.useAtLeast
        ? "Each enabled effect uses a binomial tail: sum from k = 0 to observed hits of C(n, k) p^k (1-p)^(n-k) for low outcomes, or sum from k = observed hits to n for high outcomes. The displayed result multiplies the enabled effect probabilities together."
        : "Each enabled effect uses exact binomial odds: C(n, k) p^k (1-p)^(n-k). The displayed result multiplies the enabled effect probabilities together.";
      setResultTone(outcome.status);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render(readValues());
    });

    enableMultNode.addEventListener("change", () => {
      syncInputs();
      render(readValues());
    });

    enableMoneyNode.addEventListener("change", () => {
      syncInputs();
      render(readValues());
    });

    form.addEventListener("input", () => {
      render(readValues());
    });

    syncInputs();
    render(readValues());
  };
})();
