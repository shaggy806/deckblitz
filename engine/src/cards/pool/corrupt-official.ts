import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 30291.
//
// Rulings:
//   It triggers only once even if blocked by more than one creature.

const REGEN = "{2}{B}: Regenerate this creature.";
const DISCARD = "Whenever this creature becomes blocked, defending player discards a card at random.";

export default defineCard({
  name: "Corrupt Official",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Minion"],
  power: 3,
  toughness: 1,
  text: `${REGEN}\n${DISCARD}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1, random: true },
      resolve: null,
      text: DISCARD,
    },
  ],
});
