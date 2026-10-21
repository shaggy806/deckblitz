import { defineCard } from "../define.js";

export default defineCard({
  name: "Fry",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nFry deals 5 damage to target creature or planeswalker that's white or blue.",
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: { typesAnyOf: ["creature", "planeswalker"], anyOf: [{ colors: ["W"] }, { colors: ["U"] }] },
    },
  ],
  effect: { kind: "damage", amount: 5, target: 0 },
});
