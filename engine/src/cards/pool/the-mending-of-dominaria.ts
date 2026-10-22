import { defineCard } from "../define.js";

// Dominaria. III returns the lands first, then shuffles what's left of the
// graveyard into the library.
const I_II = "I, II — Mill two cards, then you may return a creature card from your graveyard to your hand.";
const III =
  "III — Return all land cards from your graveyard to the battlefield, then shuffle your graveyard into your library.";

export default defineCard({
  name: "The Mending of Dominaria",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_II}\n${III}`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            min: 0,
            max: 1,
            destination: "hand",
            leftover: "stay",
            filter: { type: "creature" },
          },
        ],
      },
      resolve: null,
      text: I_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-from-graveyard", filter: { type: "land" }, destination: "battlefield", count: "all" },
          { kind: "shuffle-graveyard-into-library", target: "you" },
        ],
      },
      resolve: null,
      text: III,
    },
  ],
});
