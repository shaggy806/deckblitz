import { defineCard } from "../define.js";

// EDHREC rank 29536.
//
// The opponent's choice is an `as-player` of the target around a look at your
// graveyard (`from: { controllerOf: "source" }`), offered only its top two
// cards (`topOfGraveyard: 2`, rule 404.2: the top is the card put there
// last). What they pick is exiled; the other of the two is then the top card
// of your graveyard whichever was picked, so it's the `top-of-graveyard` put
// into your hand. With one card there, it's exiled and nothing is left.

const TEXT =
  "{4}, {T}: Target opponent chooses one of the top two cards of your graveyard. Exile that card and put the other one into your hand.";

export default defineCard({
  name: "Phyrexian Grimoire",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "as-player",
            who: { target: 0 },
            effect: {
              kind: "look-and-choose",
              zone: "graveyard",
              from: { controllerOf: "source" },
              filter: { topOfGraveyard: 2 },
              min: 1,
              max: 1,
              destination: "exile",
              leftover: "stay",
            },
          },
          {
            kind: "top-of-graveyard",
            whose: "you",
            then: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
