import { defineCard } from "../define.js";

// EDHREC rank 21526.

export default defineCard({
  name: "Strength of Cedars",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Target creature gets +X/+X until end of turn, where X is the number of lands you control.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { countOf: { type: "land", controlledBy: "you" } },
    toughness: { countOf: { type: "land", controlledBy: "you" } },
    duration: "end-of-turn",
  },
});
