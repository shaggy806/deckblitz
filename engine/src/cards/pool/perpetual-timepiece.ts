import { defineCard } from "../define.js";

// Amonkhet (AKH). Piper's Melody's shape: the cards go in together, then
// your library is shuffled.

const MILL = "{T}: Mill two cards. (Put the top two cards of your library into your graveyard.)";
const SHUFFLE = "{2}, Exile this artifact: Shuffle any number of target cards from your graveyard into your library.";

export default defineCard({
  name: "Perpetual Timepiece",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${MILL}\n${SHUFFLE}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 2 },
      resolve: null,
      text: MILL,
    },
    {
      cost: { mana: "{2}", tap: false, exileSelf: true },
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "you" } }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 0,
            simultaneous: true,
            effect: { kind: "put-on-library", target: 0, position: "top" },
          },
          { kind: "shuffle-library" },
        ],
      },
      resolve: null,
      text: SHUFFLE,
    },
  ],
});
