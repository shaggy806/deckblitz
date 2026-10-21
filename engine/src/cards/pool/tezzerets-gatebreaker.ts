import { defineCard } from "../define.js";

// EDHREC rank 24599.
//
// Rulings:
//   [2018-07-13] Because the last ability of Tezzeret’s Gatebreaker doesn’t change the
//     characteristics of any permanents, the set of creatures affected by it is constantly
//     updated. Creatures that come under your control later in the turn can’t be blocked.

export default defineCard({
  name: "Tezzeret's Gatebreaker",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "When this artifact enters, look at the top five cards of your library. You may reveal a blue or artifact card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.\n{5}{U}, {T}, Sacrifice this artifact: Creatures you control can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{5}{U}", tap: true, sacrifice: "self" },
      targets: [],
      // A rule for the rest of the turn (rule 611.2c): creatures that come
      // under your control later this turn can't be blocked either.
      effect: { kind: "restrict", filter: { type: "creature", controlledBy: "you" }, restrictions: ["cant-be-blocked"] },
      resolve: null,
      text: "{5}{U}, {T}, Sacrifice this artifact: Creatures you control can't be blocked this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { anyOf: [{ colors: ["U"] }, { type: "artifact" }] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: "When this artifact enters, look at the top five cards of your library. You may reveal a blue or artifact card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
    },
  ],
});
