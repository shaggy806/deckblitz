import { defineCard } from "../define.js";

// Rulings:
//   [2016-01-22] Use the number of creature cards in your graveyard as the ability resolves to
//     determine the value of X. Seed Guardian will count toward this number as long as it's still
//     in your graveyard at that time.
//   [2016-01-22] Once the Elemental is created, the number of creature cards in your graveyard
//     changing won't cause the Elemental's power or toughness to change.

const DIES_TEXT =
  "When this creature dies, create an X/X green Elemental creature token, where X is the number of creature cards in your graveyard.";

const X = { countInGraveyard: { type: "creature", ownedBy: "you" } } as const;

export default defineCard({
  name: "Seed Guardian",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      // The 0/0 green Elemental with no abilities, its base P/T set to X as
      // it's created (a fixed number from then on — the ruling).
      effect: {
        kind: "create-token",
        token: "Elemental Token (Dance of the Tumbleweeds)",
        count: 1,
        basePt: { power: X, toughness: X },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
