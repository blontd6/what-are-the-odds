(function () {
  const App = (window.App = window.App || {});
  const {
    formatPercent,
    log10MissStreakProbability,
    missStreakProbability,
    monteCarlo,
    oneIn,
    percent,
  } = App.probability;
  const { classifyOutcome } = App.outcomes;

  App.initHandOdds = function initHandOdds() {
    const form = document.querySelector("#analyzer-form");
    const probabilityNode = document.querySelector("#probability");
    const rarityNode = document.querySelector("#rarity");
    const summaryNode = document.querySelector("#summary");
    const simulationPanel = document.querySelector("#simulation");
    const simulationRateNode = document.querySelector("#simulation-rate");
    const simulationDiffNode = document.querySelector("#simulation-diff");
    const errorNode = document.querySelector("#error-message");

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
        deckSize: Number(data.get("deckSize")),
        targetCards: Number(data.get("targetCards")),
        cardsSeen: Number(data.get("cardsSeen")),
        useSim: data.get("useSim") === "on",
      };
    }

    function validate({ deckSize, targetCards, cardsSeen }) {
      if (![deckSize, targetCards, cardsSeen].every(Number.isInteger)) {
        return "Use whole numbers for all fields.";
      }

      if (deckSize <= 0) {
        return "Deck size must be at least 1.";
      }

      if (targetCards < 0 || targetCards > deckSize) {
        return "Valuable cards must be between 0 and the deck size.";
      }

      if (cardsSeen < 0 || cardsSeen > deckSize) {
        return "Cards seen must be between 0 and the deck size.";
      }

      return null;
    }

    function render(values) {
      const validationError = validate(values);

      if (validationError) {
        simulationPanel.hidden = true;
        showError(validationError);
        return;
      }

      clearError();

      const probability = missStreakProbability(
        values.deckSize,
        values.targetCards,
        values.cardsSeen,
      );
      const log10Probability = log10MissStreakProbability(
        values.deckSize,
        values.targetCards,
        values.cardsSeen,
      );
      const outcome = classifyOutcome(probability);

      probabilityNode.textContent = formatPercent(probability, log10Probability);
      rarityNode.textContent = oneIn(probability, log10Probability);
      summaryNode.textContent = outcome.text;
      setResultTone(outcome.status);

      if (!values.useSim) {
        simulationPanel.hidden = true;
        return;
      }

      const simulated = monteCarlo(values.deckSize, values.targetCards, values.cardsSeen);
      simulationRateNode.textContent = `Simulated miss rate: ${percent(simulated)}`;
      simulationDiffNode.textContent = `Difference from exact result: ${percent(
        Math.abs(simulated - probability),
      )}`;
      simulationPanel.hidden = false;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render(readValues());
    });

    render(readValues());
  };
})();
