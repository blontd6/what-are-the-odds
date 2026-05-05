# 🃏 What Are The Odds?

[![Deployment](https://img.shields.io/badge/Live-Demo-brightgreen)](https://blontd6.github.io/what-are-the-odds/)
<img width="460" height="215" alt="bal" src="https://github.com/user-attachments/assets/2da8c906-1d9d-4c2f-a8ec-f03070d0412c" />


A high-precision probability calculator designed specifically for **Balatro**.
## Features

### Hand Odds Analyzer
Calculate the exact probability of drawing specific cards from your deck.
- Supports **Cumulative (Tail) Probability**: Automatically switches between "at least" and "at most" logic to show you how lucky or unlucky your draw was.
- **Dynamic Labeling**: Dynamically identifies "Hit probability" vs "Miss probability" based on your expectation.
- **Monte Carlo Simulation**: Built-in simulation to verify exact mathematical results with empirical data.

### Lucky Card Odds
Check the probability of your Lucky Cards triggering.
- Track **Mult** and **Money** hits simultaneously.
- Accounts for **Dice count** (e.g., Oops! All 6s) which scales trigger rates by 2^n.

### Bloodstone Analyzer
Analyze your Bloodstone trigger frequency.

## Usage

1. Visit the [Website](https://blontd6.github.io/what-are-the-odds/).
2. Select the tool you need from the tabs.
3. Enter your game state values (Deck size, valuable cards, triggers, etc.).
   
## Technical Details

- **Hypergeometric Distribution**: Used for deck drawing calculations where cards are not replaced.
- **Binomial Distribution**: Used for trigger-based events (Lucky Cards, Bloodstone).
- **Log-space Math**: Uses log10 transformations for calculating extremely small probabilities (rare events) without floating-point precision issues.
---
*If this tool helped you, consider leaving a star! ⭐*
