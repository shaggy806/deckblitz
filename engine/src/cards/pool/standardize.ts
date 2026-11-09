import { defineCard } from "../define.js";

// Only the creatures on the battlefield as it resolves (its ruling).
export default defineCard({
  name: "Standardize",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose a creature type other than Wall. Each creature becomes that type until end of turn.",
  targets: [],
  effect: {
    kind: "choose-creature-type",
    exclude: ["Wall"],
    then: {
      kind: "for-each-permanent",
      filter: { type: "creature" },
      simultaneous: true,
      effect: { kind: "become", target: 0, setSubtypes: ["$chosen"], duration: "end-of-turn" },
    },
  },
});
