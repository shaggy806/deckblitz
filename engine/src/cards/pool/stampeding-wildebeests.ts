import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 24528.
//
// Rulings:
//   [2004-10-04] You choose a creature and return it all during resolution of the triggered
//     ability. This means that if you have two Wildebeests, there is no way to end up returning
//     only one creature.
//   [2004-10-04] The ability that returns a creature doesn't target anything. You can return a
//     creature with shroud or protection from green, for example. You don't decide which creature
//     to return until the ability resolves. If you control no other green creatures, you must
//     return Stampeding Wildebeests itself.
//
// Riptide Chimera's untargeted upkeep return: chosen as it resolves, exactly
// one while there is one (itself included).
const UPKEEP_TEXT = "At the beginning of your upkeep, return a green creature you control to its owner's hand.";

export default defineCard({
  name: "Stampeding Wildebeests",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Antelope", "Beast"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", colors: ["G"], controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a green creature you control to its owner's hand",
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
