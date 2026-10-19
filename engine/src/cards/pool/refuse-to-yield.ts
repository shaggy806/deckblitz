import { defineCard } from "../define.js";

export default defineCard({
  name: "Refuse to Yield",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+7 until end of turn. Untap it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 7, duration: "end-of-turn" },
      { kind: "untap", target: 0 },
    ],
  },
});
