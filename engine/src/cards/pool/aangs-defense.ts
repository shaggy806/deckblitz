import { defineCard } from "../define.js";

export default defineCard({
  name: "Aang's Defense",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target blocking creature you control gets +2/+2 until end of turn.\nDraw a card.",
  targets: [{ kind: "permanent", whose: "you", filter: { blocking: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});
