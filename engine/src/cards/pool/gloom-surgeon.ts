import { defineCard } from "../define.js";

// EDHREC rank 27818.
//
// Rulings:
//   [2012-05-01] If damage that can't be prevented (such as the damage Malignus deals) is dealt to
//     Gloom Surgeon, you'll still exile cards from your library.
//   [2012-05-01] Combat damage that would be dealt to Gloom Surgeon will be prevented even if you
//     can't exile that many cards from the top of your library.
// "Would be dealt to this creature": one replacement per simultaneous damage
// event (`perEvent`), so two blockers exile their total once. The engine has
// no damage that can't be prevented, so the first ruling never arises.
const TEXT =
  "If combat damage would be dealt to this creature, prevent that damage and exile that many cards from the top of your library.";

export default defineCard({
  name: "Gloom Surgeon",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: true,
        prevent: true,
        perEvent: true,
        to: "self",
        then: { kind: "exile-from-library", amount: "x" },
      },
      text: TEXT,
    },
  ],
});
