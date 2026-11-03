import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] If you do not have enough cards in your library, the damage is still prevented and
//     all the cards in your library are exiled.
//
// Deflecting Palm's shape: `then` is what follows the prevention (rule 615.5),
// with "x" the damage it prevented.
const TEXT =
  "{2}, {T}: The next time a source of your choice would deal damage to you this turn, prevent that damage. Exile cards from the top of your library equal to the damage prevented this way.";

export default defineCard({
  name: "Bone Mask",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      text: TEXT,
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        to: "you",
        amount: "next-time",
        then: { kind: "exile-from-library", amount: "x" },
      },
      resolve: null,
    },
  ],
});
