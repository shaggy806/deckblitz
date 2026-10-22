import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 20295.
const UPKEEP = "At the beginning of your upkeep, put a spore counter on this creature.";
const PING = "Remove three spore counters from this creature: It deals 1 damage to any target.";

export default defineCard({
  name: "Thorn Thallid",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 2,
  toughness: 2,
  text: `${UPKEEP}\n${PING}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "spore", amount: 1 },
      resolve: null,
      text: UPKEEP,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "spore", count: 3 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING,
    },
  ],
});
