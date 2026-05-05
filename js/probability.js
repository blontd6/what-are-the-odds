(function () {
  const App = (window.App = window.App || {});

  function nCk(n, k) {
    if (k < 0 || k > n) {
      return 0;
    }

    const adjustedK = Math.min(k, n - k);
    let result = 1;

    for (let i = 1; i <= adjustedK; i += 1) {
      result = (result * (n - adjustedK + i)) / i;
    }

    return result;
  }

  function percent(x) {
    return `${(x * 100).toFixed(6)}%`;
  }

  function scientificFromLog10(log10Value, digits = 2) {
    if (!Number.isFinite(log10Value)) {
      return "0";
    }

    const exponent = Math.floor(log10Value);
    const mantissa = 10 ** (log10Value - exponent);

    return `${mantissa.toFixed(digits)}e${exponent >= 0 ? "+" : ""}${exponent}`;
  }

  function formatPercent(probability, log10Probability = null) {
    if (probability > 0) {
      return percent(probability);
    }

    if (log10Probability === null || !Number.isFinite(log10Probability)) {
      return "0.000000%";
    }

    return `${scientificFromLog10(log10Probability + 2, 6)}%`;
  }

  function oneIn(probability, log10Probability = null) {
    if (probability === 0 && (log10Probability === null || !Number.isFinite(log10Probability))) {
      return "impossible";
    }

    const reciprocal = 1 / probability;

    if (Number.isFinite(reciprocal)) {
      return `1 in ${reciprocal.toFixed(2)}`;
    }

    const reciprocalLog10 = probability > 0 ? -Math.log10(probability) : -log10Probability;

    return `1 in ${scientificFromLog10(reciprocalLog10)}`;
  }

  function hypergeometricProbability(deckSize, targetCards, cardsSeen, hits) {
    if (hits < 0 || hits > targetCards || hits > cardsSeen || deckSize - targetCards < cardsSeen - hits) {
      return 0;
    }
    return (nCk(targetCards, hits) * nCk(deckSize - targetCards, cardsSeen - hits)) / nCk(deckSize, cardsSeen);
  }

  function log10Combination(n, k) {
    if (k < 0 || k > n) {
      return -Infinity;
    }

    const adjustedK = Math.min(k, n - k);
    let total = 0;

    for (let i = 1; i <= adjustedK; i += 1) {
      total += Math.log10(n - adjustedK + i) - Math.log10(i);
    }

    return total;
  }

  function log10Add(log10A, log10B) {
    if (!Number.isFinite(log10A)) {
      return log10B;
    }

    if (!Number.isFinite(log10B)) {
      return log10A;
    }

    const max = Math.max(log10A, log10B);
    const min = Math.min(log10A, log10B);

    return max + Math.log10(1 + 10 ** (min - max));
  }

  function log10HypergeometricProbability(deckSize, targetCards, cardsSeen, hits) {
    if (hits < 0 || hits > targetCards || hits > cardsSeen || deckSize - targetCards < cardsSeen - hits) {
      return -Infinity;
    }
    return (
      log10Combination(targetCards, hits) +
      log10Combination(deckSize - targetCards, cardsSeen - hits) -
      log10Combination(deckSize, cardsSeen)
    );
  }

  function hypergeometricAtLeastProbability(deckSize, targetCards, cardsSeen, minimumHits) {
    let total = 0;
    const maxHits = Math.min(targetCards, cardsSeen);
    for (let hits = minimumHits; hits <= maxHits; hits += 1) {
      total += hypergeometricProbability(deckSize, targetCards, cardsSeen, hits);
    }
    return total;
  }

  function log10HypergeometricAtLeastProbability(deckSize, targetCards, cardsSeen, minimumHits) {
    let total = -Infinity;
    const maxHits = Math.min(targetCards, cardsSeen);
    for (let hits = minimumHits; hits <= maxHits; hits += 1) {
      total = log10Add(total, log10HypergeometricProbability(deckSize, targetCards, cardsSeen, hits));
    }
    return total;
  }

  function hypergeometricAtMostProbability(deckSize, targetCards, cardsSeen, maximumHits) {
    let total = 0;
    for (let hits = 0; hits <= maximumHits; hits += 1) {
      total += hypergeometricProbability(deckSize, targetCards, cardsSeen, hits);
    }
    return total;
  }

  function log10HypergeometricAtMostProbability(deckSize, targetCards, cardsSeen, maximumHits) {
    let total = -Infinity;
    for (let hits = 0; hits <= maximumHits; hits += 1) {
      total = log10Add(total, log10HypergeometricProbability(deckSize, targetCards, cardsSeen, hits));
    }
    return total;
  }

  function tailHypergeometricMode(deckSize, targetCards, cardsSeen, hits) {
    const expectedHits = (cardsSeen * targetCards) / deckSize;
    const useAtMost = hits < expectedHits;

    return {
      expectedHits,
      direction: useAtMost ? "at most" : "at least",
      probability: useAtMost
        ? hypergeometricAtMostProbability(deckSize, targetCards, cardsSeen, hits)
        : hypergeometricAtLeastProbability(deckSize, targetCards, cardsSeen, hits),
      log10Probability: useAtMost
        ? log10HypergeometricAtMostProbability(deckSize, targetCards, cardsSeen, hits)
        : log10HypergeometricAtLeastProbability(deckSize, targetCards, cardsSeen, hits),
    };
  }

  function binomialProbability(trials, hits, chance) {
    return nCk(trials, hits) * chance ** hits * (1 - chance) ** (trials - hits);
  }

  function log10BinomialProbability(trials, hits, chance) {
    if (chance === 0) {
      return hits === 0 ? 0 : -Infinity;
    }

    if (chance === 1) {
      return hits === trials ? 0 : -Infinity;
    }

    return (
      log10Combination(trials, hits) +
      hits * Math.log10(chance) +
      (trials - hits) * Math.log10(1 - chance)
    );
  }

  function binomialAtLeastProbability(trials, minimumHits, chance) {
    let total = 0;

    for (let hits = minimumHits; hits <= trials; hits += 1) {
      total += binomialProbability(trials, hits, chance);
    }

    return total;
  }

  function log10BinomialAtLeastProbability(trials, minimumHits, chance) {
    let total = -Infinity;

    for (let hits = minimumHits; hits <= trials; hits += 1) {
      total = log10Add(total, log10BinomialProbability(trials, hits, chance));
    }

    return total;
  }

  function binomialAtMostProbability(trials, maximumHits, chance) {
    let total = 0;

    for (let hits = 0; hits <= maximumHits; hits += 1) {
      total += binomialProbability(trials, hits, chance);
    }

    return total;
  }

  function log10BinomialAtMostProbability(trials, maximumHits, chance) {
    let total = -Infinity;

    for (let hits = 0; hits <= maximumHits; hits += 1) {
      total = log10Add(total, log10BinomialProbability(trials, hits, chance));
    }

    return total;
  }

  function tailProbabilityMode(trials, hits, chance) {
    const expectedHits = trials * chance;
    const useAtMost = hits < expectedHits;

    return {
      expectedHits,
      direction: useAtMost ? "at most" : "at least",
      probability: useAtMost
        ? binomialAtMostProbability(trials, hits, chance)
        : binomialAtLeastProbability(trials, hits, chance),
      log10Probability: useAtMost
        ? log10BinomialAtMostProbability(trials, hits, chance)
        : log10BinomialAtLeastProbability(trials, hits, chance),
    };
  }

  function luckyRate(baseDenominator, diceCount) {
    const rawChance = 2 ** diceCount / baseDenominator;

    return {
      rawChance,
      effectiveChance: Math.min(rawChance, 1),
    };
  }

  async function monteCarlo(deckSize, targetCards, cardsSeen, targetHits = 0, useAtLeast = false, trials = 25000, onProgress = null) {
    let matchingTrials = 0;
    const expectedHits = (cardsSeen * targetCards) / deckSize;
    const isAtMost = useAtLeast && targetHits < expectedHits;
    const chunkSize = 5000;

    for (let start = 0; start < trials; start += chunkSize) {
      const end = Math.min(start + chunkSize, trials);

      for (let trial = start; trial < end; trial += 1) {
        let hitsSeen = 0;
        let remainingDeck = deckSize;
        let remainingTargets = targetCards;

        for (let draw = 0; draw < cardsSeen; draw += 1) {
          const hit = Math.random() < remainingTargets / remainingDeck;

          if (hit) {
            hitsSeen += 1;
            remainingTargets -= 1;
          }

          remainingDeck -= 1;
        }

        let match = false;
        if (useAtLeast) {
          if (isAtMost) {
            match = hitsSeen <= targetHits;
          } else {
            match = hitsSeen >= targetHits;
          }
        } else {
          match = hitsSeen === targetHits;
        }

        if (match) {
          matchingTrials += 1;
        }
      }

      if (onProgress) {
        onProgress(end / trials);
      }

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return matchingTrials / trials;
  }

  App.probability = {
    binomialProbability,
    formatPercent,
    hypergeometricProbability,
    log10BinomialProbability,
    log10HypergeometricProbability,
    luckyRate,
    monteCarlo,
    oneIn,
    percent,
    tailBinomialMode: tailProbabilityMode,
    tailHypergeometricMode,
  };
})();
