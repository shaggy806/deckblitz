import { defineCard } from "../define.js";

// EDHREC rank 25755. Front face of Grizzled Angler // Grisly Anglerfish.
//
// Rulings:
//   - A colorless creature card already in your graveyard doesn't transform it
//     yet: it transforms only as the activated ability resolves.
//
// Deathbonnet Sprout's "mill, then if …, transform": checked after the mill.

const TEXT =
  "{T}: Mill two cards. Then if there is a colorless creature card in your graveyard, transform this creature.";

export default defineCard({
  name: "Grizzled Angler",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 3,
  text: `${TEXT} (To mill two cards, put the top two cards of your library into your graveyard.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "conditional",
            condition: { kind: "cards-in-graveyard", atLeast: 1, filter: { type: "creature", colorless: true } },
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Grizzled Angler", "Grisly Anglerfish"],
  transform: true,
});
