import { defineCard } from "../define.js";

// EDHREC rank 22368.
//
// Old Rutstein's shape: the Saprolings are counted off the cards this
// resolution milled (`thisWay: "milled"`), as they are now.

const ATTACK_TEXT =
  "Whenever this creature attacks, mill two cards. For each creature card milled this way, create a 1/1 green Saproling creature token.";

export default defineCard({
  name: "Tribune of Rot",
  manaCost: "{1}{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 3,
  toughness: 3,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 2 },
          {
            kind: "create-token",
            token: "Saproling Token",
            count: { thisWay: "milled", filter: { type: "creature" } },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
