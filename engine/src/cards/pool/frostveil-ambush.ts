import { defineCard } from "../define.js";

// EDHREC rank 20963. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] Frostveil Ambush can target a creature that's already tapped. That creature
//     won't untap during its controller's next untap step.

// Done's shape: two optional slots, the second a different creature.
export default defineCard({
  name: "Frostveil Ambush",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{1}" },
  text: "Tap up to two target creatures. Those creatures don't untap during their controller's next untap step.\nCycling {1} ({1}, Discard this card: Draw a card.)",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "tap", target: 0, doesntUntapNext: true },
      { kind: "tap", target: 1, doesntUntapNext: true },
    ],
  },
});
