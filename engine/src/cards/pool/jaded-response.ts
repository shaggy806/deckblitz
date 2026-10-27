import { defineCard } from "../define.js";

// Apocalypse (APC). Colours are checked as it resolves (its ruling): the
// target spell shares a colour with a creature you control when, for some one
// of the five colours, both the spell and a creature you control have it.
const shares = (c: "W" | "U" | "B" | "R" | "G") =>
  ({
    kind: "all",
    of: [
      { kind: "target", index: 0, filter: { colors: [c] } },
      { kind: "controls", filter: { type: "creature", colors: [c] }, atLeast: 1 },
    ],
  }) as const;

export default defineCard({
  name: "Jaded Response",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell if it shares a color with a creature you control.",
  targets: ["spell"],
  effect: {
    kind: "conditional",
    condition: { kind: "any", of: [shares("W"), shares("U"), shares("B"), shares("R"), shares("G")] },
    then: { kind: "counter", target: 0 },
  },
});
