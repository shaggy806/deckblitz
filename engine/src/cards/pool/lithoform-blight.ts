import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 20002.
//
// Its land types go in layer 4 (`loseLandTypes`, and with them its intrinsic mana
// abilities, 305.7), its abilities in layer 6; the two granted ones stay.
//
// Rulings:
//   [2020-09-25] If the target land is an illegal target by the time Lithoform Blight tries to
//     resolve, the spell doesn't resolve. It doesn't enter the battlefield, so you don't draw a
//     card.
//   [2020-09-25] The enchanted land keeps any other card types (such as artifact) and supertypes
//     (such as basic or legendary) when it loses its land types.

export default defineCard({
  name: "Lithoform Blight",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land\nWhen this Aura enters, draw a card.\nEnchanted land loses all land types and abilities and has \"{T}: Add {C}\" and \"{T}, Pay 1 life: Add one mana of any color.\"",
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this Aura enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      loseLandTypes: true,
      loseAllAbilities: true,
      grantsActivated: [
        addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
        {
          cost: { mana: null, tap: true, payLife: 1 },
          targets: [],
          effect: { kind: "add-mana", mana: "any-color", amount: 1 },
          resolve: null,
          text: "{T}, Pay 1 life: Add one mana of any color.",
        },
      ],
      text: 'Enchanted land loses all land types and abilities and has "{T}: Add {C}" and "{T}, Pay 1 life: Add one mana of any color."',
    },
  ],
});
