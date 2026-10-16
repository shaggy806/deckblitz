import { defineCard } from "../define.js";

// EDHREC rank 12632. The Lost Caverns of Ixalan.
//
// Rulings:
//   [2023-11-10] Use Stalactite Stalker's power as it last existed on the battlefield to determine
//     the value of X.
//   [2023-11-10] Abilities that begin with "At the beginning of your end step, if you descended
//     this turn" will trigger only once during your end step, no matter how many times you
//     descended this turn.
//   [2023-11-10] These cards don't need to have been under your control at the time you
//     descended.
//
// The end-step counter is Enterprising Scallywag's `turn-history` "descended"
// intervening "if". The sacrifice ability's X is Wall of Limbs' `powerOf:
// "source"`, read as it last existed (rule 608.2h); a negative power is 0
// (rule 107.1b — `ptChangeValue`).

const END_TEXT =
  "At the beginning of your end step, if you descended this turn, put a +1/+1 counter on this creature.";
const SAC_TEXT =
  "{2}{B}, Sacrifice this creature: Target creature gets -X/-X until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Stalactite Stalker",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: `Menace\n${END_TEXT} (You descended if a permanent card was put into your graveyard from anywhere.)\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "descended" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: [{ powerOf: "source" }, -1] },
        toughness: { product: [{ powerOf: "source" }, -1] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
