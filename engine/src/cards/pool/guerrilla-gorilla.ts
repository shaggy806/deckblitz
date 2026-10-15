import { defineCard } from "../define.js";

// EDHREC rank 18078.

const SAC_TEXT =
  "Sacrifice this creature: Destroy target noncreature artifact or noncreature enchantment. Activate only as a sorcery.";

export default defineCard({
  name: "Guerrilla Gorilla",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ape", "Soldier", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "enchantment"], notTypes: ["creature"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: SAC_TEXT,
      sorcerySpeed: true,
    },
  ],
});
