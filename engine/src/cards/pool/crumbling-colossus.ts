import { defineCard } from "../define.js";

const TEXT = "When this creature attacks, sacrifice it at end of combat.";

export default defineCard({
  name: "Crumbling Colossus",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 7,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        effect: { kind: "sacrifice-target", target: "source" },
        text: "Sacrifice Crumbling Colossus.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
