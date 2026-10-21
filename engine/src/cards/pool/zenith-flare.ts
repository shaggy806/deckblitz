import { defineCard } from "../define.js";

// EDHREC rank 16507.
//
// Rulings:
//   [2020-04-17] If the chosen target is an illegal target by the time Zenith Flare tries to
//     resolve, the spell won’t resolve. You won’t gain X life.

// X is counted as it resolves: cards with a cycling ability (typecycling
// included, rule 702.29e) in your graveyard.
const X = { countInGraveyard: { hasCycling: true, ownedBy: "you" } } as const;

export default defineCard({
  name: "Zenith Flare",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: X, target: 0 },
      { kind: "gain-life", amount: X },
    ],
  },
  text: "Zenith Flare deals X damage to any target and you gain X life, where X is the number of cards with a cycling ability in your graveyard.",
});
