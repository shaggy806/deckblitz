import { defineCard } from "../define.js";

// EDHREC rank 14191.
//
// Rulings:
//   [2004-12-01] If you copy an Arcane spell that has cards spliced onto it, you'll copy the
//     spliced text as well as the original spell text.

const COPY_TEXT =
  "{2}, Return two lands you control to their owner's hand: Copy target instant or sorcery spell. You may choose new targets for the copy.";

export default defineCard({
  name: "Uyo, Silent Prophet",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${COPY_TEXT}`,
  activated: [
    {
      // Pearl Lake Ancient's land-return cost, Insidious Will's copy.
      cost: { mana: "{2}", tap: false, returnToHand: { count: 2, filter: { type: "land" } } },
      targets: ["instant-or-sorcery-spell"],
      effect: { kind: "copy-spell", target: 0, newTargets: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
