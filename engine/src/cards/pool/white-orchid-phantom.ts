import { defineCard } from "../define.js";

// EDHREC rank 7197. Modern Horizons 3.
//
// Sandworm's shape with an "up to one" slot: the search follows the destroy
// whether or not the land was destroyed (an indestructible one — the first
// ruling), by the land's controller as it last existed; none of it happens if
// the chosen land is an illegal target (the second), and with no land chosen
// nobody searches.
//
// Rulings:
//   [2024-06-07] If the target land isn't destroyed by White Orchid Phantom's last ability
//     (perhaps because the land has indestructible), its controller still gets to search for a
//     basic land card.
//   [2024-06-07] If the target land is an illegal target when White Orchid Phantom's last ability
//     tries to resolve, it won't resolve and none of its effects will happen. That land's
//     controller won't get to search for a basic land card.

const ETB_TEXT =
  "When this creature enters, destroy up to one target nonbasic land. Its controller may search their library for a basic land card, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "White Orchid Phantom",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "first-strike"],
  text: `Flying, first strike\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "land", notSupertype: "basic" } } }],
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
