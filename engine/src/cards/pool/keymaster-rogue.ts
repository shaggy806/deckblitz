import { defineCard } from "../define.js";

// EDHREC rank 24249.
//
// Rulings:
//   [2013-01-24] Keymaster Rogue’s last ability isn’t optional. If Keymaster Rogue is the only
//     creature you control when the ability resolves, you’ll have to return it to its owner’s
//     hand.

export default defineCard({
  name: "Keymaster Rogue",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 3,
  toughness: 2,
  text: "This creature can't be blocked.\nWhen this creature enters, return a creature you control to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a creature you control to its owner's hand",
      },
      resolve: null,
      text: "When this creature enters, return a creature you control to its owner's hand.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
});
