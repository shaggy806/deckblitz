import { defineCard } from "../define.js";

// EDHREC rank 26528.
//
// Rulings:
//   [2018-12-07] The creature you sacrifice for the ability of Stitcher's Apprentice could be the
//     Homunculus you've just created. It could also be Stitcher's Apprentice itself.
//   [2018-12-07] You create a token and sacrifice a creature all while the activated ability is
//     resolving. Nothing can happen between the two, and no player may choose to take actions.
//
// Joo Dee's create-then-sacrifice: the sacrifice is chosen after the token
// exists, so the new Homunculus is a candidate.

const TEXT = "{1}{U}, {T}: Create a 2/2 blue Homunculus creature token, then sacrifice a creature.";

export default defineCard({
  name: "Stitcher's Apprentice",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Homunculus Token (2/2)", count: 1 },
          { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
