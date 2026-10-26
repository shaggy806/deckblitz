import { defineCard } from "../define.js";

// The intervening-if (its ruling) is checked as the trigger fires and again as
// it resolves — any creature with power 5 or greater, not the same one.
const TRIGGER_TEXT =
  "At the beginning of your end step, if you control a creature with power 5 or greater, you may have this creature deal 2 damage to target player or planeswalker.";

export default defineCard({
  name: "Exuberant Firestoker",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Druid", "Shaman"],
  power: 1,
  toughness: 1,
  text: `${TRIGGER_TEXT}\n{T}: Add {C}.`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 5 } }, atLeast: 1 },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "may",
        prompt: "Have Exuberant Firestoker deal 2 damage to target player or planeswalker?",
        effect: { kind: "damage", amount: 2, target: 0 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
