import { defineCard } from "../define.js";

// EDHREC rank 25616. Four of the top eight are exiled at random (nobody
// chooses: `atRandom`), then the four left on top are looked at again and put
// back in any order (the ruling: you see them before ordering). With fewer than
// eight cards, four of those there go, and the rest are ordered.

const TEXT =
  "{R}, {T}: Look at the top eight cards of your library. Exile four of them at random, then put the rest on top of your library in any order.";

export default defineCard({
  name: "Orcish Librarian",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 8,
            min: 4,
            max: 4,
            destination: "exile",
            leftover: "stay",
            atRandom: true,
          },
          { kind: "look-and-choose", zone: "library", count: 4, min: 4, max: 4, destination: "library-top", leftover: "stay" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
