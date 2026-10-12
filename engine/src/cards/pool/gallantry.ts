import { defineCard } from "../define.js";

export default defineCard({
  name: "Gallantry",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target blocking creature gets +4/+4 until end of turn.\nDraw a card.",
  targets: [{ kind: "permanent", filter: { blocking: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});
