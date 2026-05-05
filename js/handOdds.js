(function () {
  const App = (window.App = window.App || {});
  const {
    formatPercent,
    hypergeometricProbability,
    log10HypergeometricProbability,
    tailHypergeometricMode,
    monteCarlo,
    oneIn,
    percent,
  } = App.probability;
  const { classifyOutcome, classifyLuckyOutcome } = App.outcomes;

  App.initHandOdds = function initHandOdds() {
    const form = document.querySelector("#analyzer-form");
    const useSimInput = document.querySelector("#use-sim");
    const simTrialsContainer = document.querySelector("#sim-trials-container");
    const probabilityLabelNode = document.querySelector("#probability-label");
    const probabilityNode = document.querySelector("#probability");
    const rarityNode = document.querySelector("#rarity");
    const summaryNode = document.querySelector("#summary");
    const formulaNode = document.querySelector("#formula");
    const simulationPanel = document.querySelector("#simulation");
    const simulationProgressNode = document.querySelector("#simulation-progress");
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
        targetHits: Number(data.get("targetHits")),
        useAtLeast: data.get("useAtLeast") === "on",
        useSim: data.get("useSim") === "on",
        simTrials: Number(data.get("simTrials") || 25000),
      };
    }

    function validate({ deckSize, targetCards, cardsSeen, targetHits }) {
      if (![deckSize, targetCards, cardsSeen, targetHits].every(Number.isInteger)) {
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

      if (targetHits < 0 || targetHits > targetCards || targetHits > cardsSeen || deckSize - targetCards < cardsSeen - targetHits) {
        return "Target hits must be possible given the deck size, valuable cards, and cards seen.";
      }

      return null;
    }

    async function render(values) {
      const validationError = validate(values);

      if (validationError) {
        simulationPanel.hidden = true;
        showError(validationError);
        return;
      }

      clearError();

      const tailMode = values.useAtLeast
        ? tailHypergeometricMode(values.deckSize, values.targetCards, values.cardsSeen, values.targetHits)
        : null;

      const probability = values.useAtLeast
        ? tailMode.probability
        : hypergeometricProbability(values.deckSize, values.targetCards, values.cardsSeen, values.targetHits);
      const log10Probability = values.useAtLeast
        ? tailMode.log10Probability
        : log10HypergeometricProbability(values.deckSize, values.targetCards, values.cardsSeen, values.targetHits);

      const expectedHits = (values.cardsSeen * values.targetCards) / values.deckSize;
      const isLucky = values.targetHits >= expectedHits;
      const outcome = isLucky ? classifyLuckyOutcome(probability) : classifyOutcome(probability);

      probabilityLabelNode.textContent = isLucky ? "Hit probability" : "Miss probability";
      probabilityNode.textContent = formatPercent(probability, log10Probability);
      rarityNode.textContent = oneIn(probability, log10Probability);
      summaryNode.textContent = outcome.text;
      setResultTone(outcome.status);

      if (values.useAtLeast) {
        formulaNode.textContent = `Hypergeometric cumulative (${tailMode.direction} ${values.targetHits} hits): Sum of C(valuable cards, hits) * C(deck size - valuable cards, cards seen - hits) / C(deck size, cards seen)`;
      } else {
        formulaNode.textContent = `Hypergeometric mass (exactly ${values.targetHits} hits): C(valuable cards, ${values.targetHits}) * C(deck size - valuable cards, cards seen - ${values.targetHits}) / C(deck size, cards seen)`;
      }

      if (!values.useSim) {
        simulationPanel.hidden = true;
        return;
      }

      simulationPanel.hidden = false;
      simulationProgressNode.hidden = false;
      simulationRateNode.textContent = "Simulating...";
      simulationDiffNode.textContent = "";

      const simulated = await monteCarlo(
        values.deckSize,
        values.targetCards,
        values.cardsSeen,
        values.targetHits,
        values.useAtLeast,
        values.simTrials,
        (progress) => {
          simulationProgressNode.textContent = `Progress: ${(progress * 100).toFixed(1)}%`;
        }
      );

      simulationProgressNode.hidden = true;
      simulationRateNode.textContent = `Simulated hit rate: ${percent(simulated)}`;
      simulationDiffNode.textContent = `Difference from exact result: ${percent(
        Math.abs(simulated - probability),
      )}`;
    }

    useSimInput.addEventListener("change", () => {
      simTrialsContainer.hidden = !useSimInput.checked;
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await render(readValues());
    });

    simTrialsContainer.hidden = !useSimInput.checked;
    render(readValues());
  };
})();
