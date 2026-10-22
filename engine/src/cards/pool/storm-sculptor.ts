import { defineCard } from "../define.js";

// EDHREC rank 24295.
//
// Rulings:
//   [2017-09-29] Storm Sculptor's last ability doesn't target the creature you'll return to hand.
//     You choose one as the ability resolves.
//   [2017-09-29] Storm Sculptor's last ability isn't optional. If Storm Sculptor is the only
//     creature you control when the ability resolves, you'll have to return it to its owner's
//     hand.

const TEXT = "When this creature enters, return a creature you control to its owner's hand.";

export default defineCard({
  name: "Storm Sculptor",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 3,
  toughness: 2,
  text: `This creature can't be blocked.\n${TEXT}`,
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
      text: TEXT,
    },
  ],
  static: [{ affects: { scope: "self" }, grantKeywords: ["unblockable"], text: "This creature can't be blocked." }],
});
