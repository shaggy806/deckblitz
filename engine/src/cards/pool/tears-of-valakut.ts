import { defineCard } from "../define.js";

export default defineCard({
  name: "Tears of Valakut",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nTears of Valakut deals 5 damage to target creature with flying.",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: { kind: "damage", amount: 5, target: 0 },
});
