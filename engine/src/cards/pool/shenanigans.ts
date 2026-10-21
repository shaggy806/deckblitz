import { defineCard } from "../define.js";

export default defineCard({
  name: "Shenanigans",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  dredge: 1,
  text: "Destroy target artifact.\nDredge 1 (If you would draw a card, you may mill a card instead. If you do, return this card from your graveyard to your hand.)",
  targets: ["artifact"],
  effect: { kind: "destroy", target: 0 },
});
