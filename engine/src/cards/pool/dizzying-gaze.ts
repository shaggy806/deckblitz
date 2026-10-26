import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 24010.

export default defineCard({
  name: "Dizzying Gaze",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature you control\n{R}: Enchanted creature deals 1 damage to target creature with flying.",
  targets: ["creature-you-control"],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "damage", amount: 1, target: 0, from: "attached" },
      resolve: null,
      text: "{R}: Enchanted creature deals 1 damage to target creature with flying.",
    },
  ],
});
