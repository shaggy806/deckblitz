import { defineCard } from "../define.js";

export default defineCard({
  name: "Veteran's Reflexes",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +1/+1 until end of turn. Untap that creature.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "untap", target: 0 },
    ],
  },
});
