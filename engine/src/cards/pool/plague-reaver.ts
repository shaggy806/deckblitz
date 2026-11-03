import { defineCard } from "../define.js";

const END_STEP = "At the beginning of your end step, sacrifice each other creature you control.";
const RETURN =
  "Discard two cards, Sacrifice this creature: Choose target opponent. Return this creature to the battlefield under that player's control at the beginning of their next upkeep.";

export default defineCard({
  name: "Plague Reaver",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 6,
  toughness: 5,
  text: `${END_STEP}\n${RETURN}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "sacrifice-all", who: "you", filter: { type: "creature", isSource: false } },
      resolve: null,
      text: END_STEP,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self", discard: { count: 2 } },
      targets: ["opponent"],
      effect: {
        kind: "delayed-trigger",
        at: "your-next-upkeep",
        turnOf: { target: 0 },
        effect: { kind: "put-onto-battlefield", target: "source", under: { target: 0 } },
        text: "Return this creature to the battlefield under that player's control at the beginning of their next upkeep.",
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
