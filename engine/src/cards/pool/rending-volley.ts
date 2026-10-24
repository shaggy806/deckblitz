import { defineCard } from "../define.js";

export default defineCard({
  name: "Rending Volley",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "This spell can't be countered.\nRending Volley deals 4 damage to target white or blue creature.",
  cantBeCountered: true,
  targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ colors: ["W"] }, { colors: ["U"] }] } }],
  effect: { kind: "damage", amount: 4, target: 0 },
});
