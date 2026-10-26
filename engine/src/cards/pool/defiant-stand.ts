import { defineCard } from "../define.js";

// EDHREC rank 31766.

export default defineCard({
  name: "Defiant Stand",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cast this spell only during the declare attackers step and only if you've been attacked this step.\nTarget creature gets +1/+3 until end of turn. Untap that creature.",
  castOnlyIf: { kind: "attacked-this-step" },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 3, duration: "end-of-turn" },
      { kind: "untap", target: 0 },
    ],
  },
});
