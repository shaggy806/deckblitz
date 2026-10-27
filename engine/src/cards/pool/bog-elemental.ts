import { defineCard } from "../define.js";

// EDHREC rank 30656.

const UPKEEP = "At the beginning of your upkeep, sacrifice this creature unless you sacrifice a land.";

export default defineCard({
  name: "Bog Elemental",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 4,
  text: `Protection from white\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "land" }, text: "Sacrifice a land" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
  ],
});
