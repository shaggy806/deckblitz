import { defineCard } from "../define.js";

// EDHREC rank 30540.
//
// Rulings:
//   [2011-09-22] The creature card isn't chosen at random until the ability resolves.
//   [2011-09-22] Woodland Sleuth could die in response to its own morbid ability. If this happens,
//     the ability could return Woodland Sleuth to its owner's hand.
//
// Haunted Fengraf's random return, behind Hollowhenge Scavenger's morbid check.

const TEXT =
  "Morbid — When this creature enters, if a creature died this turn, return a creature card at random from your graveyard to your hand.";

export default defineCard({
  name: "Woodland Sleuth",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "creature-died-this-turn" },
      targets: [],
      effect: {
        kind: "choose-random-card",
        zone: "graveyard",
        filter: { type: "creature" },
        then: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
