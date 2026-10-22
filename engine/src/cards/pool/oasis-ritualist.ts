import { defineCard } from "../define.js";

// EDHREC rank 23017. Hour of Devastation. Two mana abilities; the second's
// cost exerts it (rule 701.43), so the auto-payer leaves it to the player.
export default defineCard({
  name: "Oasis Ritualist",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Druid"],
  power: 2,
  toughness: 4,
  text: "{T}: Add one mana of any color.\n{T}, Exert this creature: Add two mana of any one color. (An exerted creature won't untap during your next untap step.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: null, tap: true, exertSelf: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 2 },
      resolve: null,
      text: "{T}, Exert this creature: Add two mana of any one color.",
    },
  ],
});
