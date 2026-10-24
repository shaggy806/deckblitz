import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 18869.
//
// Myr Custodian's "may scry 1" over every player, in turn order (the
// ruling: they choose in turn order; each sees only their own card).
const TEXT =
  "When this creature enters, each player may scry 1. (To scry 1, look at the top card of your library, then you may put that card on the bottom.)";

export default defineCard({
  name: "Eager Construct",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "each-player-may", who: "each-player", prompt: "Scry 1?", effect: { kind: "scry", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
