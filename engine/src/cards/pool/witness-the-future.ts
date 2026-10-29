import { defineCard } from "../define.js";

// EDHREC rank 18090.
// The cards are the target player's; a player gone illegal shuffles nothing and the cards stay put,
// while illegal cards alone still leave the library to be shuffled (the rulings).

export default defineCard({
  name: "Witness the Future",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player shuffles up to four target cards from their graveyard into their library. You look at the top four cards of your library, then put one of those cards into your hand and the rest on the bottom of your library in a random order.",
  targets: [
    "player",
    { kind: "any-number", of: { kind: "card-in-graveyard" }, max: 4, sameController: { slot: 0 } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "target-legal", index: 0 },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "for-each-target",
              from: 1,
              simultaneous: true,
              effect: { kind: "put-on-library", target: 1, position: "top" },
            },
            { kind: "shuffle-library", target: 0 },
          ],
        },
      },
      {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-random",
      },
    ],
  },
});
