import { defineCard } from "../define.js";

const FACES = ["Gallifrey Falls // No More", "Gallifrey Falls", "No More"];

// The left half of Gallifrey Falls // No More (see gallifrey-falls-no-more.ts).
export default defineCard({
  name: "Gallifrey Falls",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Gallifrey Falls deals 4 damage to each creature. If a creature dealt damage this way would die this turn, exile it instead.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", amount: 4, filter: { type: "creature" } },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
    ],
  },
  faces: FACES,
  split: true,
});
