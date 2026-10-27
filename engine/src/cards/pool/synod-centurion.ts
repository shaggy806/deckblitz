import { defineCard } from "../define.js";

// EDHREC rank 31382. Fifth Dawn. A state trigger (rule 603.8), Emperor
// Crocodile's shape over artifacts.

export default defineCard({
  name: "Synod Centurion",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 4,
  toughness: 4,
  text: "When you control no other artifacts, sacrifice this creature.",
  triggered: [
    {
      trigger: {
        on: "state",
        state: {
          kind: "not",
          of: { kind: "controls", filter: { type: "artifact" }, atLeast: 1, excludeSelf: true },
        },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When you control no other artifacts, sacrifice this creature.",
    },
  ],
});
