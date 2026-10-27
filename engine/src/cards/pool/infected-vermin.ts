import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 22567. Pestilence Demon's ability, and a
// threshold-gated bigger one (Cabal Torturer's activation condition).

const SMALL_TEXT = "{2}{B}: This creature deals 1 damage to each creature and each player.";
const THRESHOLD_TEXT =
  "Threshold — {3}{B}: This creature deals 3 damage to each creature and each player. Activate only if there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Infected Vermin",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 1,
  toughness: 1,
  text: `${SMALL_TEXT}\n${THRESHOLD_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
          { kind: "damage", amount: 1, who: "each-player" },
        ],
      },
      resolve: null,
      text: SMALL_TEXT,
    },
    {
      cost: { mana: "{3}{B}", tap: false },
      condition: { kind: "threshold" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: 3 },
          { kind: "damage", amount: 3, who: "each-player" },
        ],
      },
      resolve: null,
      text: THRESHOLD_TEXT,
    },
  ],
});
