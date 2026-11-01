import { defineCard } from "../define.js";

export default defineCard({
  name: "Mire's Toll",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player reveals a number of cards from their hand equal to the number of Swamps you control. You choose one of them. That player discards that card.",
  targets: ["player"],
  effect: {
    kind: "discard-chosen",
    target: 0,
    reveals: { countOf: { subtype: "Swamp", controlledBy: "you" } },
  },
});
