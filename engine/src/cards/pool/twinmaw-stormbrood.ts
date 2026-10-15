import { defineCard } from "../define.js";

// EDHREC rank 14278.
//
// Rulings:
//   [2025-04-04] If a spell is cast as an Omen, its controller shuffles it into its owner's
//     library instead of putting it into its owner's graveyard as it resolves.
//   [2025-04-04] An omen card is a creature card in every zone except the stack, as well as while
//     on the stack if not cast as an Omen. Ignore its alternative characteristics in those cases.

const ETB_TEXT = "When this creature enters, you gain 5 life.";

export default defineCard({
  name: "Twinmaw Stormbrood",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 5 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  faces: ["Twinmaw Stormbrood", "Charring Bite"],
  omen: true,
});
