(function () {
  const App = (window.App = window.App || {});

  function classifyOutcome(probability) {
    if (probability < 0.0001) {
      return {
        text: "Genuinely horrid luck.",
        status: "status-extreme",
      };
    }

    if (probability < 0.001) {
      return {
        text: "Extremely unlikely.",
        status: "status-extreme",
      };
    }

    if (probability < 0.01) {
      return {
        text: "Very rare.",
        status: "status-rare",
      };
    }

    if (probability < 0.05) {
      return {
        text: "A little unlucky.",
        status: "status-rare",
      };
    }

    return {
      text: "Common outcome. You ain't unlucky bud.",
      status: "status-common",
    };
  }

  function classifyLuckyOutcome(probability) {
    if (probability < 0.0001) {
      return {
        text: "Nearly impossible!",
        status: "status-extreme",
      };
    }

    if (probability < 0.001) {
      return {
        text: "Very sharp outlier.",
        status: "status-extreme",
      };
    }

    if (probability < 0.01) {
      return {
        text: "Rare result.",
        status: "status-rare",
      };
    }

    if (probability < 0.05) {
      return {
        text: "Noticeably uncommon.",
        status: "status-rare",
      };
    }

    return {
      text: "Reasonably common/Within expectation.",
      status: "status-common",
    };
  }

  App.outcomes = {
    classifyLuckyOutcome,
    classifyOutcome,
  };
})();
