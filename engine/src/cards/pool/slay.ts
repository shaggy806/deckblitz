import { defineCard } from "../define.js";

export default defineCard({
  name: "Slay",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target green creature. It can't be regenerated.\nDraw a card.",
  targets: [{ kind: "permanent", filter: { colors: ["G"], type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "destroy", target: 0, cantBeRegenerated: true }, { kind: "draw", amount: 1 }],
  },
});
