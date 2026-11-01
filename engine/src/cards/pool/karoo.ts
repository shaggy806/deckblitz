import { defineCard } from "../define.js";
import { entersTappedStatic } from "../helpers.js";

const TRIGGER = "When this land enters, sacrifice it unless you return an untapped Plains you control to its owner's hand.";

export default defineCard({
  name: "Karoo",
  types: ["land"],
  text: `This land enters tapped.\n${TRIGGER}\n{T}: Add {C}{W}.`,
  static: [entersTappedStatic("This land")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [
          {
            returnToHand: { subtype: "Plains", controlledBy: "you", tapped: false },
            text: "Return an untapped Plains you control to its owner's hand",
          },
        ],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["C", "W"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {C}{W}.",
    },
  ],
});
