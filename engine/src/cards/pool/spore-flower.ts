import { defineCard } from "../define.js";

// EDHREC rank 15099. Fallen Empires.

const UPKEEP = "At the beginning of your upkeep, put a spore counter on this creature.";
const FOG = "Remove three spore counters from this creature: Prevent all combat damage that would be dealt this turn.";

export default defineCard({
  name: "Spore Flower",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 0,
  toughness: 1,
  text: `${UPKEEP}\n${FOG}`,
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "spore", count: 3 } },
      targets: [],
      effect: { kind: "prevent-all-combat-damage" },
      resolve: null,
      text: FOG,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "spore", amount: 1 },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
