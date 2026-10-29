import { defineCard } from "../define.js";

// EDHREC rank 8002.
//
// Each player chooses in turn order from the active player (you, in your
// upkeep), the chosen cards staying face down in hand, then all are discarded
// at once (the ruling; rule 101.4 — a `discard` over several players).
const TEXT = "At the beginning of your upkeep, each player discards a card.";

export default defineCard({
  name: "Cunning Lethemancer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "discard", target: "each-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
