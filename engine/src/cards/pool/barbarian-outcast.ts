import { defineCard } from "../define.js";

// EDHREC rank 31371. Torment.

export default defineCard({
  name: "Barbarian Outcast",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian", "Beast"],
  power: 2,
  toughness: 2,
  text: "When you control no Swamps, sacrifice this creature.",
  triggered: [
    {
      trigger: {
        on: "state",
        state: { kind: "not", of: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 } },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you control no Swamps, sacrifice this creature.",
    },
  ],
});
