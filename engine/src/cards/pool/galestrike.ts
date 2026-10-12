import { defineCard } from "../define.js";

export default defineCard({
  name: "Galestrike",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target tapped creature to its owner's hand.\nDraw a card.",
  targets: [{ kind: "permanent", filter: { tapped: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "return-to-hand", target: 0 }, { kind: "draw", amount: 1 }],
  },
});
