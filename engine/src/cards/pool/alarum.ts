import { defineCard } from "../define.js";

export default defineCard({
  name: "Alarum",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Untap target nonattacking creature. It gets +1/+3 until end of turn.",
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: false } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: 1, toughness: 3, duration: "end-of-turn" },
    ],
  },
});
