import { defineCard } from "../define.js";

export default defineCard({
  name: "Misinformation",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Put up to three target cards from an opponent's graveyard on top of their library in any order.",
  // The cards, not the opponent, are targeted (the ruling). "In any order":
  // they go on in the order chosen, so the last one chosen ends on top.
  targets: [
    { kind: "any-number", of: { kind: "card-in-graveyard", whose: "opponent" }, max: 3, sameController: true },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "put-on-library", target: 0, position: "top" },
  },
});
