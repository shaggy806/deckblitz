import { defineCard } from "../define.js";

// A 1/1 colorless Triskelavite artifact creature with flying and "Sacrifice
// this token: This token deals 1 damage to any target." — Triskelavus's token.
export default defineCard({
  name: "Triskelavite Token",
  art: "b5ddb67c-82fb-42d6-a4c2-11cd38eb128d",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Triskelavite"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nSacrifice this token: This token deals 1 damage to any target.",
  activated: [
    {
      cost: { tap: false, sacrifice: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "Sacrifice this token: This token deals 1 damage to any target.",
    },
  ],
});
