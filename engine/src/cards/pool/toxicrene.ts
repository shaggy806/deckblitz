import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 13782.
//
// Each land's own abilities go, its intrinsic mana ones too (`loseAllAbilities`),
// and the granted one, from the same static, stays.
//
// Rulings:
//   [2022-10-07] If a permanent has an ability that causes itself to be a land, such as that of
//     Ashaya, Soul of the Wild, that ability will apply to it even though it loses that ability
//     due to Toxicrene. This is because type-changing effects are always applied before any
//     effects that add or remove abilities. It will still have "{T}: Add one mana of any color"
//     and lose all other abilities.

export default defineCard({
  name: "Toxicrene",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 2,
  toughness: 4,
  keywords: ["reach", "deathtouch"],
  text: "Reach, deathtouch\nHypertoxic Miasma — All lands have \"{T}: Add one mana of any color\" and lose all other abilities.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "land" } },
      grantsActivated: [addManaAbility({ mana: "any-color", text: "{T}: Add one mana of any color." })],
      loseAllAbilities: true,
      text: 'Hypertoxic Miasma — All lands have "{T}: Add one mana of any color" and lose all other abilities.',
    },
  ],
});
