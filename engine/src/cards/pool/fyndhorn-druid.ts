import { defineCard } from "../define.js";

// "Was blocked" is `blockedThisTurn`'s `"blocked-by"` side, read of the creature that died.

const TEXT = "When this creature dies, if it was blocked this turn, you gain 4 life.";

export default defineCard({
  name: "Fyndhorn Druid",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "trigger-object", filter: { blockedThisTurn: { relation: "blocked-by" } } },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: TEXT,
    },
  ],
});
