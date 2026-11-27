import { defineCard } from "../define.js";

// EDHREC rank 29039.
//
// Rulings:
//   Can be used more than once in a turn. Each time, the opponent can pay to prevent giving first
//     strike to a creature, but this payment only stops the current activation and not future
//     activations of Tidal Flats.
//   First Strike is granted to your creatures currently blocking non-Flyers when this effect
//     resolves.
//   The payment is made when the Tidal Flats effect resolves.

const TEXT =
  "{U}{U}: For each attacking creature without flying, its controller may pay {1}. If that player doesn't, creatures you control blocking that creature gain first strike until end of turn.";

export default defineCard({
  name: "Tidal Flats",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{U}{U}", tap: false },
      targets: [],
      // One question per attacker, asked of its controller as this resolves;
      // the first strike for those declined is given once all have answered,
      // to your creatures blocking each then (the rulings).
      effect: {
        kind: "for-each-unless",
        of: { permanents: { type: "creature", attacking: true, notKeyword: "flying" } },
        asks: "controller",
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: {
          kind: "grant-keyword-all",
          filter: { type: "creature", controlledBy: "you", blockingRelation: { relation: "blocking", of: 0 } },
          keyword: "first-strike",
          duration: "end-of-turn",
        },
        as: 0,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
