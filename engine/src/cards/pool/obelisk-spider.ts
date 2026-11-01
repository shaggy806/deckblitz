import { defineCard } from "../define.js";

// EDHREC rank 4836.

const COMBAT_TEXT = "Whenever this creature deals combat damage to a creature, put a -1/-1 counter on that creature.";
const DRAIN_TEXT = "Whenever you put one or more -1/-1 counters on a creature, each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Obelisk Spider",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 1,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${COMBAT_TEXT}\n${DRAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-recipient", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "any", counter: "-1/-1", filter: { type: "creature" }, byYou: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
