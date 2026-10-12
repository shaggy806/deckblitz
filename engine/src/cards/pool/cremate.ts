import { defineCard } from "../define.js";

export default defineCard({
  name: "Cremate",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target card from a graveyard.\nDraw a card.",
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: { kind: "sequence", effects: [{ kind: "exile", target: 0 }, { kind: "draw", amount: 1 }] },
});
