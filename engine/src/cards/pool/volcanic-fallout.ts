import { defineCard } from "../define.js";

export default defineCard({
  name: "Volcanic Fallout",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nVolcanic Fallout deals 2 damage to each creature and each player.",
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, amount: 2 },
      { kind: "damage", amount: 2, who: "each-player" },
    ],
  },
});
