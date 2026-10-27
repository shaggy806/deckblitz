import { defineCard } from "../define.js";

// EDHREC rank 27159.

export default defineCard({
  name: "Hunger of the Nim",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target creature gets +1/+0 until end of turn for each artifact you control.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { countOf: { type: "artifact", controlledBy: "you" } },
    toughness: 0,
    duration: "end-of-turn",
  },
});
