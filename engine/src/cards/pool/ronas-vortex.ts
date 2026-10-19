import { defineCard } from "../define.js";

export default defineCard({
  name: "Rona's Vortex",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Kicker {2}{B} (You may pay an additional {2}{B} as you cast this spell.)\n" +
    "Return target creature or planeswalker you don't control to its owner's hand. If this spell was kicked, put that permanent on the bottom of its owner's library instead.",
  targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "return-to-hand", target: 0 },
  kicker: {
    cost: "{2}{B}",
    effect: { kind: "put-on-library", target: 0, position: "bottom" },
  },
});
