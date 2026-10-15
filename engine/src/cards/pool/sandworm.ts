import { defineCard } from "../define.js";

// EDHREC rank 18443.
//
// Erode's shape: the search follows the destroy whether or not the land was
// destroyed (an indestructible one — the ruling), by the land's controller
// (as it last existed), and none of it happens if the target is illegal.
//
// Rulings:
//   [2025-06-06] If Sandworm's last ability resolves but doesn't destroy the target land (probably
//     because the land had indestructible), the target land's controller still gets to search for
//     a basic land card.
//   [2025-06-06] If the target land is an illegal target when Sandworm's last ability tries to
//     resolve, it won't resolve and none of its effects will happen. The target land's controller
//     won't search for a basic land card.

const ETB_TEXT =
  "When this creature enters, destroy target land. Its controller may search their library for a basic land card, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Sandworm",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Worm"],
  power: 5,
  toughness: 4,
  keywords: ["haste"],
  text: `Haste\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          {
            kind: "search-library",
            who: { controllerOfTarget: 0 },
            filter: { type: "land", supertype: "basic" },
            destination: "battlefield",
            enterTapped: true,
            min: 0,
            max: 1,
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
